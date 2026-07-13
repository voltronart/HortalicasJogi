/* =========================================================
   HORTALIÇAS JOGI — INTRO DE NUVENS (EIXO Z) + CARDÁPIO
========================================================= */
 
document.addEventListener('DOMContentLoaded', () => {
  initCloudIntro();
  initCardapio();
});
 
/* ---------- INTRO: NUVENS NO EIXO Z ----------
   Cada nuvem começa "longe" (z negativo, escala pequena) e
   se aproxima da câmera (z positivo, escala maior) conforme
   o usuário rola a página — como se estivesse voando por elas. */
 
function initCloudIntro(){
  const introSection = document.getElementById('cloud-intro');
  const scene = document.getElementById('cloud-scene');
  const copy = document.getElementById('intro-copy');
  if (!introSection || !scene) return;
 
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;
 
  // x/y = posição na tela (%), z0/z1 = distância inicial/final, s0/s1 = escala inicial/final
  const cloudConfigs = [
    { x: -28, y: -12, z0: -1600, z1: 420, s0: 0.5,  s1: 1.6 },
    { x:  24, y:   4, z0: -2000, z1: 320, s0: 0.4,  s1: 1.4 },
    { x: -10, y:  24, z0: -1200, z1: 520, s0: 0.6,  s1: 1.8 },
    { x:  34, y: -20, z0: -1800, z1: 360, s0: 0.45, s1: 1.5 },
    { x:   0, y:  -2, z0: -2400, z1: 260, s0: 0.35, s1: 1.3 },
    { x: -34, y:  15, z0: -1000, z1: 460, s0: 0.55, s1: 1.7 },
  ];
 
  // Menos nuvens no mobile pra manter a rolagem leve
  const activeConfigs = isMobile ? cloudConfigs.slice(0, 4) : cloudConfigs;
 
  const clouds = activeConfigs.map(cfg => {
    const wrap = document.createElement('div');
    wrap.className = 'cloud';
    wrap.style.left = `calc(50% + ${cfg.x}%)`;
    wrap.style.top  = `calc(50% + ${cfg.y}%)`;
    wrap.innerHTML = '<svg viewBox="0 0 200 110"><use href="#cloud-shape"></use></svg>';
    scene.appendChild(wrap);
    return { el: wrap, ...cfg };
  });
 
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
 
  // Sem GSAP/ScrollTrigger ou com "reduzir movimento" ligado:
  // mostra as nuvens já paradas, sem pin e sem animação de rolagem.
  if (!hasGsap || reduceMotion) {
    clouds.forEach(c => {
      c.el.style.transform = 'translate(-50%, -50%) scale(1)';
      c.el.style.opacity = '0.9';
    });
    if (copy) {
      copy.style.opacity = '1';
    }
    return;
  }
 
  gsap.registerPlugin(ScrollTrigger);
  gsap.set(scene, { perspective: 1000 });
  gsap.set(copy, { opacity: 0, y: 30 });
 
  clouds.forEach(c => {
    gsap.set(c.el, {
      z: c.z0,
      scale: c.s0,
      xPercent: -50,
      yPercent: -50,
      opacity: 0,
    });
  });
 
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: introSection,
      start: 'top top',
      end: '+=220%',
      scrub: 1,
      pin: true,
    }
  });
 
  // Todas as nuvens correm no mesmo intervalo (0 a 1) do scroll;
  // a diferença de distância/escala de cada uma já cria a sensação
  // de profundidade e velocidades diferentes (perto passa "rápido").
  clouds.forEach(c => {
    tl.to(c.el, { z: c.z1, scale: c.s1, opacity: 1, ease: 'none', duration: 1 }, 0);
    tl.to(c.el, { opacity: 0, duration: 0.22, ease: 'none' }, 0.78);
  });
 
  tl.to(copy, { opacity: 1, y: 0, duration: 0.25, ease: 'none' }, 0.5);
  tl.to(copy, { opacity: 0, y: -20, duration: 0.15, ease: 'none' }, 0.85);
 
  window.addEventListener('resize', () => ScrollTrigger.refresh());
}
/* =========================================================
   EDITE AQUI TODA SEMANA — é só trocar os textos abaixo.
   Cada bloco é uma "semana", com um título (ex: "Semana 1 · ...")
   e uma lista de "itens" com nome + caminho da imagem.
   Pode adicionar ou remover semanas e itens à vontade.
========================================================= */

const cardapio = [
  { semana: "Cardápio da Semana", itens: [
      { nome: "Acelga",   img: "img/acelga.png" },
      { nome: "Agrião", img: "img/agriao.png" },
      { nome: "Alface Crespa",         img: "img/alface-crespa.png" },
      { nome: "Alface Roxa",  img: "img/alface roxa.png" },
      { nome: "Alface Americana",       img: "img/alface-americana.png" },
      { nome: "Brócolis de Cabeça",          img: "img/brocolis-cabeca.png" },
      { nome: "Brócolis de Rama",          img: "img/brocolis-rama.png" },
      { nome: "Cheiro Verde",       img: "img/cheiro.png" },
      { nome: "Couve",       img: "img/couve.png" },
      { nome: "Rúcula",    img: "img/rucula.png" },
      { nome: "Mostarda",          img: "img/mostarda.png" },
      
  ]},
 /* { semana: "Semana 2 · 21 a 25 de julho", itens: [
      { nome: "Alface crespa",   img: "img/alface.jpg" },
      { nome: "Tomate italiano", img: "img/tomate.jpg" },
      { nome: "Cenoura",         img: "img/cenoura.jpg" },
      { nome: "Couve manteiga",  img: "img/couve.jpg" },
      { nome: "Abobrinha",       img: "img/abobrinha.jpg" },
      { nome: "Pepino",          img: "img/pepino.jpg" },
      { nome: "Rúcula",          img: "img/rucula.jpg" },
      { nome: "Beterraba",       img: "img/beterraba.jpg" },
      { nome: "Cebolinha",       img: "img/cebolinha.jpg" },
      { nome: "Repolho roxo",    img: "img/repolho.jpg" },
      { nome: "Chuchu",          img: "img/chuchu.jpg" },
      { nome: "Salsa",           img: "img/salsa.jpg" },
      { nome: "Espinafre",       img: "img/espinafre.jpg" },
      { nome: "Pimentão",        img: "img/pimentao.jpg" },
      { nome: "Alho",            img: "img/alho.jpg" },
  ]},
*/
  ];

/* ========= Não precisa mexer daqui pra baixo ========= */

const container = document.getElementById("lista-semanas");

cardapio.forEach(({ semana, itens }) => {
  const bloco = document.createElement("div");
  bloco.className = "dia";

  const titulo = document.createElement("h2");
  titulo.textContent = semana;
  bloco.appendChild(titulo);

  const lista = document.createElement("ul");
  itens.forEach(item => {
    const li = document.createElement("li");

    const img = document.createElement("img");
    img.src = item.img;
    img.alt = item.nome;
    img.onerror = () => { img.style.display = "none"; };

    const nome = document.createElement("span");
    nome.textContent = item.nome;

    li.appendChild(img);
    li.appendChild(nome);
    lista.appendChild(li);
  });
  bloco.appendChild(lista);

  container.appendChild(bloco);
});
