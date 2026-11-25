/*
 * AIBeck — cada pedido do formulário do site vira oportunidade no AIBeck OS (CRM).
 *
 * O Netlify chama esta função sozinho a cada envio verificado de formulário
 * (evento "submission-created"). Ela grava no mesmo documento do Firestore que o CRM usa
 * (aibeck_private/{uid}), com controle de concorrência: se o CRM estiver salvando ao mesmo
 * tempo, a função lê de novo e tenta outra vez, sem sobrescrever nada.
 *
 * Variáveis de ambiente (Netlify → Project configuration → Environment variables):
 *   FIREBASE_SERVICE_ACCOUNT  JSON da conta de serviço do Firebase (obrigatória)
 *   AIBECK_OWNER_UID          UID do dono no Firebase Auth (opcional; se faltar, usa o único
 *                             documento existente em aibeck_private)
 * Nenhuma chave fica no código nem no site.
 */
import { createSign } from 'node:crypto';

const FORM_NAME = 'aibeck-leads';
const COLLECTION = 'aibeck_private';
const MAX_BYTES = 850000; // mesma margem de segurança do CRM

/* ---------- conversão JSON <-> formato do Firestore (REST) ---------- */
export function toFs(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'string') return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: v.length ? { values: v.map(toFs) } : {} };
  if (typeof v === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(v).filter(([, x]) => x !== undefined).map(([k, x]) => [k, toFs(x)])) } };
  return { stringValue: String(v) };
}
export function fromFs(v) {
  if (!v || 'nullValue' in v) return null;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('stringValue' in v) return v.stringValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(fromFs);
  if ('mapValue' in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, fromFs(x)]));
  if ('referenceValue' in v) return v.referenceValue;
  if ('geoPointValue' in v) return v.geoPointValue;
  if ('bytesValue' in v) return v.bytesValue;
  return null;
}

/* ---------- token de acesso a partir da conta de serviço ---------- */
async function accessToken(sa, fetchImpl = fetch) {
  const now = Math.floor(Date.now() / 1000);
  const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  const head = b64({ alg: 'RS256', typ: 'JWT' });
  const claim = b64({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/datastore', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 });
  const signer = createSign('RSA-SHA256'); signer.update(`${head}.${claim}`);
  const jwt = `${head}.${claim}.${signer.sign(sa.private_key, 'base64url')}`;
  const r = await fetchImpl('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }) });
  if (!r.ok) throw new Error('Falha ao autenticar no Google: ' + r.status);
  return (await r.json()).access_token;
}

/* ---------- monta cliente, oportunidade e atividade a partir do pedido ---------- */
const id = () => Math.random().toString(36).slice(2, 11);
const isoDay = (d = new Date()) => new Date(d.getTime() - 3 * 3600e3).toISOString().slice(0, 10); // dia em Brasília
const clean = (s, n = 2000) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

export function buildRecords(data, now = new Date()) {
  const today = isoDay(now);
  const tomorrow = isoDay(new Date(now.getTime() + 86400e3));
  const nome = clean(data.nome, 120), empresa = clean(data.empresa, 120), contato = clean(data.contato, 160);
  const produto = clean(data.produto, 80) || 'A definir';
  const email = /@/.test(contato) ? contato : '';
  const phone = !email && /\d{8,}/.test(contato.replace(/\D/g, '')) ? contato : '';
  const notes = [
    `Pedido recebido pelo site aibeck.com.br em ${today}.`,
    nome && `Nome: ${nome}`, empresa && `Empresa: ${empresa}`, contato && `Contato: ${contato}`,
    `Interesse: ${produto}`, data.momento && `Momento: ${clean(data.momento, 80)}`,
    data.segmento && `Segmento: ${clean(data.segmento, 80)}`,
    data.desafio && `Desafio: ${clean(data.desafio)}`,
    data.blueprint && `Blueprint: ${clean(data.blueprint, 1500)}`,
  ].filter(Boolean).join('\n');

  const client = { id: id(), name: empresa || nome || 'Contato do site', contact: nome, email, phone, segment: clean(data.segmento, 80), status: 'Prospect', created: today, notes };
  const deal = { id: id(), clientId: client.id, title: `Site · ${produto} · ${empresa || nome || 'novo contato'}`, stage: 'Novo contato', value: 0, probability: 20, serviceId: '', owner: 'Diretoria', source: 'Site aibeck.com.br', nextAction: 'Responder pedido do site', nextDate: tomorrow, created: today, notes, priority: /agora/i.test(data.momento || '') ? 'Alta' : 'Média' };
  const activity = { id: id(), clientId: client.id, dealId: deal.id, type: 'Pedido pelo site', description: `Novo pedido pelo formulário do site (${produto}).`, date: today, nextDate: tomorrow };
  return { client, deal, activity };
}

/* ---------- grava no Firestore com controle de concorrência ---------- */
async function addToCrm(records, env, fetchImpl = fetch) {
  const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
  const base = `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents`;
  const token = await accessToken(sa, fetchImpl);
  const auth = { Authorization: `Bearer ${token}` };

  let uid = (env.AIBECK_OWNER_UID || '').trim();
  if (!uid) {
    const r = await fetchImpl(`${base}/${COLLECTION}?pageSize=5&mask.fieldPaths=revision`, { headers: auth });
    const docs = (await r.json()).documents || [];
    if (docs.length !== 1) throw new Error(`Defina AIBECK_OWNER_UID: encontrei ${docs.length} documentos em ${COLLECTION}.`);
    uid = docs[0].name.split('/').pop();
  }
  const url = `${base}/${COLLECTION}/${uid}`;

  for (let attempt = 1; attempt <= 5; attempt++) {
    const r = await fetchImpl(url, { headers: auth });
    if (!r.ok) throw new Error('Não foi possível ler o CRM: ' + r.status);
    const doc = await r.json();
    const state = fromFs(doc.fields?.state);
    const revision = Number(doc.fields?.revision?.integerValue || 0);
    if (!state || state.version !== 3 || !Array.isArray(state.deals) || !Array.isArray(state.clients)) throw new Error('Estrutura do CRM não reconhecida; nada foi gravado.');

    // não duplica: mesmo contato + mesmo dia já registrado
    const dup = state.deals.some(d => d.source === 'Site aibeck.com.br' && d.created === records.deal.created && (d.notes || '').includes(records.client.contact || '§') && (d.notes || '').includes(records.client.email || records.client.phone || '§'));
    if (dup) return { skipped: 'duplicado' };

    state.clients.push(records.client);
    state.deals.push(records.deal);
    (state.activities ||= []).unshift(records.activity);

    if (Buffer.byteLength(JSON.stringify(state)) > MAX_BYTES) throw new Error('CRM perto do limite de 1 MiB; pedido não gravado (veja o e-mail do Netlify).');

    const body = { fields: { revision: toFs(revision + 1), state: toFs(state), updatedAt: { timestampValue: new Date().toISOString() } } };
    const w = await fetchImpl(`${url}?currentDocument.updateTime=${encodeURIComponent(doc.updateTime)}`, { method: 'PATCH', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (w.ok) return { ok: true, revision: revision + 1, dealId: records.deal.id };
    if (w.status !== 400 && w.status !== 409 && w.status !== 412) throw new Error('Falha ao gravar no CRM: ' + w.status + ' ' + (await w.text()).slice(0, 200));
    await new Promise(res => setTimeout(res, 400 * attempt)); // o CRM salvou no meio; tenta de novo
  }
  throw new Error('O CRM estava sendo editado; não consegui gravar após 5 tentativas.');
}

export default async (req) => {
  try {
    const { payload } = await req.json();
    if (!payload || payload.form_name !== FORM_NAME) return new Response('ignorado', { status: 200 });
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) { console.warn('FIREBASE_SERVICE_ACCOUNT não configurada; pedido só fica no Netlify Forms.'); return new Response('sem configuração', { status: 200 }); }
    const result = await addToCrm(buildRecords(payload.data || {}), process.env);
    console.log('AIBeck CRM:', JSON.stringify(result));
    return new Response('ok', { status: 200 });
  } catch (err) {
    // O pedido continua salvo no Netlify Forms e chega por e-mail mesmo se o CRM falhar.
    console.error('AIBeck CRM: erro', err.message);
    return new Response('erro registrado', { status: 200 });
  }
};
export { addToCrm };
