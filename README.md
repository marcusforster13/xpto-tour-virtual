# XPTO — Tour Virtual (demo)

Site estático (HTML + CSS + JS puro, sem build) em formato de **mapa
inteligente**: a imagem principal fica no centro/fundo da tela (é o "frame
zero" compartilhado por todos os ambientes), e ao lado tem uma lista de
ambientes. Ao clicar num item da lista, toca o vídeo daquele ambiente
(que visualmente começa a partir dessa mesma cena) e abre uma caixa com
uma descrição curta do espaço.

Como ainda não há vídeos reais, ao clicar em qualquer item da lista o site
mostra a própria imagem (assets/sala-controle.png) com um efeito de zoom no
lugar do vídeo — é só pra você ver a experiência funcionando.

## Estrutura

```
virtual-tour-demo/
├── index.html
├── style.css
├── script.js
├── README.md
└── assets/
    ├── sala-controle.png      <- imagem do primeiro ambiente
    ├── logo.png
    └── videos/
        ├── sala-controle.mp4          <- (ainda não existe, você vai adicionar)
        ├── sala-reuniao-veritas.mp4
        ├── sala-reuniao-tikvah.mp4
        ├── equipamentos.mp4
        └── sala-descanso.mp4
```

## Como adicionar seus renders/vídeos de verdade

1. Se você tem uma **sequência de renders** (tipo os frames de "entrando" na
   sala), a forma mais simples é transformar essa sequência num vídeo .mp4
   curto (2 a 4 segundos costuma bastar). Dá pra fazer isso com o próprio
   software que gerou os renders (export de animação) ou com ffmpeg:

   ```bash
   ffmpeg -framerate 30 -i render_%03d.png -c:v libx264 -pix_fmt yuv420p sala-controle.mp4
   ```

2. Coloque o arquivo `.mp4` dentro de `assets/videos/`, com o mesmo nome
   que está configurado em `script.js` (ou mude o nome lá).

3. Coloque uma imagem de capa (o frame inicial, por exemplo) em `assets/`,
   pra aparecer no card do painel antes do clique.

4. Abra `script.js` e edite o array `ROOMS` no topo do arquivo — é só
   configuração, não precisa mexer no resto do código:

   ```js
   {
     id: "reuniao-veritas",
     camLabel: "CAM 02",
     title: "Sala de Reunião 1 — Veritas",
     description: "Espaço reservado para reuniões estratégicas...",
     video: "assets/videos/sala-reuniao-veritas.mp4",
     startTime: 0, // em que segundo do vídeo começar
   }
   ```

   `description` é o texto que aparece na caixinha de informações quando a
   pessoa entra naquele ambiente — pode editar à vontade.

   `startTime` é útil se o seu vídeo tiver alguns segundos "mortos" no
   início e você quiser que o clique já comece no frame certo.

5. Quer mais ambientes? Só adicionar mais objetos nesse array — o painel
   (grid de câmeras) se ajusta sozinho.

## Rodando localmente

Não precisa de build nem de servidor especial. Duas opções:

- Abrir `index.html` direto no navegador, **ou**
- Rodar um servidor local simples (recomendado, evita bloqueios de CORS
  com vídeo):

  ```bash
  npx serve .
  ```

## Publicando no Vercel

1. Suba a pasta pro GitHub:

   ```bash
   git init
   git add .
   git commit -m "tour virtual koto - demo"
   git branch -M main
   git remote add origin SEU_REPOSITORIO_AQUI
   git push -u origin main
   ```

2. No [vercel.com](https://vercel.com), clique em **Add New → Project**,
   importe esse repositório.

3. Como é um site estático puro, o Vercel detecta sozinho — não precisa
   configurar comando de build nem output directory. É só clicar em
   **Deploy**.

4. Pronto, toda vez que você der `git push`, o Vercel atualiza o site
   automaticamente.

## Próximos passos que dá pra evoluir depois

- Botões dentro do próprio ambiente pra "andar" pra outro ponto da sala
  (ex: da Sala de Controle ir direto pro Auditório sem voltar ao painel).
- Áudio ambiente sutil ao entrar em cada sala.
- Um mini-mapa da empresa mostrando em qual ambiente a pessoa está.
- Textos/legendas explicando o que cada ambiente faz (bom pra apresentar
  a empresa pra clientes).
