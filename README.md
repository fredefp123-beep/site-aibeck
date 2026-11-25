# Site AIBeck

Site institucional da AIBeck (aibeck.com.br), hospedado no Netlify.

- `site/` — arquivos publicados (HTML, CSS, JS, imagens).
- `docs/` — notas internas de publicação. Não vão pro ar.
- `netlify.toml` — diz ao Netlify para publicar só a pasta `site/`.

## Fluxo de alterações
1. Cada alteração é feita numa branch e vira um Pull Request.
2. O Netlify gera um link de prévia (Deploy Preview) para o PR.
3. Aprovado → merge na `main` → o Netlify publica sozinho.
