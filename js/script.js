/* =========================================================
   SCRIPT.JS — Hortaliças Jogi
   Feito para casar com o HTML/CSS existentes.
   Usa GSAP + ScrollTrigger (já carregados via CDN no HTML),
   mas todo bloco tem guarda pra não quebrar nada caso
   algum elemento não exista ou o GSAP falhe ao carregar.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  const hasGSAP = typeof window.gsap !== 'undefined';
  const hasST   = hasGSAP && typeof window.ScrollTrigger !== 'undefined';

  if (hasGSAP && hasST) {
    gsap.registerPlugin(ScrollTrigger);
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* =======================================================
     1. NAV — troca de estilo ao rolar + scroll suave
        compensando a altura da nav fixa
     ======================================================= */
  (function initNav () {
    const nav = document.getElementById('nav');
    if (!nav) return;

    const toggleNav = () => {
      if (window.scrollY > 60) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };

    toggleNav();
    window.addEventListener('scroll', toggleNav, { passive: true });

    const links = nav.querySelectorAll('a[href^="#"]');
    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();
        const navHeight = nav.getBoundingClientRect().height;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  })();


  /* =======================================================
     2. NUVENS — SVGs desenhados, com profundidade e
        deriva contínua
        --------------------------------------------------
        Estrutura gerada por nuvem:
          .cloud-wrap  -> cuida da POSIÇÃO (top/left) e do
                          parallax de rolagem (sobe/desce
                          junto com o scroll da intro)
          .cloud       -> um <svg> desenhado à mão, com
                          contorno orgânico (várias curvas
                          bézier, não um blob genérico) e
                          um gradiente de luz (branco em
                          cima, azul-acinzentado embaixo,
                          como a sombra natural da nuvem)

        3 camadas simulam profundidade atmosférica: nuvens
        de fundo = menores, mais apagadas, mais desfocadas
        e mais lentas; nuvens da frente = maiores, mais
        nítidas, mais rápidas.
     ======================================================= */
  (function initClouds () {
    const layer = document.getElementById('skyLayer');
    if (!layer) return;

    if (layer.dataset.cloudsReady === 'true') return;
    layer.dataset.cloudsReady = 'true';

    // ---- silhuetas de nuvem desenhadas à mão (3 variações) ----
    // cada uma tem seu próprio viewBox e proporção (altura/largura),
    // pra manter a forma correta ao redimensionar
    const variantesNuvem = [
      {
        viewBox: '0 0 240 120',
        gradEnd: '#dce8f0',
        path: 'M50,95 C25,95 8,78 10,60 C11,44 26,32 42,34 C45,16 64,4 85,6 C104,8 118,20 122,36 C140,26 164,32 170,50 C190,50 205,64 202,80 C199,94 182,96 168,95 Z'
      },
      {
        viewBox: '0 0 260 100',
        gradEnd: '#e3edf3',
        path: 'M40,80 C18,80 4,66 6,52 C8,38 22,28 36,30 C36,14 52,3 70,4 C88,5 100,16 102,30 C116,20 138,20 150,32 C168,26 188,34 190,50 C210,48 226,60 224,72 C222,82 206,82 194,80 Z'
      },
      {
        viewBox: '0 0 200 110',
        gradEnd: '#d9e6ee',
        path: 'M46,90 C22,90 6,74 8,58 C10,42 26,30 42,32 C44,14 62,2 82,4 C100,6 112,18 114,32 C132,24 154,32 158,48 C176,46 190,60 186,74 C182,86 166,88 152,86 Z'
      }
    ];

    // gera o markup de uma nuvem, com um id de gradiente único
    // (precisa ser único no documento inteiro, senão duas nuvens
    // podem "roubar" o gradiente uma da outra)
    const criarSvgNuvem = (uid) => {
      const v = variantesNuvem[Math.floor(Math.random() * variantesNuvem.length)];
      const [, , vbW, vbH] = v.viewBox.split(' ').map(Number);
      const gradId = `cloudGrad-${uid}`;

      const markup = `
        <svg viewBox="${v.viewBox}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="100%" stop-color="${v.gradEnd}"/>
            </linearGradient>
          </defs>
          <path fill="url(#${gradId})" d="${v.path}"/>
        </svg>
      `;

      return { markup, ratio: vbH / vbW };
    };

    const isMobile = window.innerWidth < 600;

    // além do tamanho/opacidade/blur, cada camada agora tem:
    // escalaVoo    -> o quanto a nuvem cresce até o fim do scroll
    //                 (nuvens da frente crescem muito mais = parecem
    //                 passar bem perto de quem está rolando a página)
    // distanciaVoo -> o quanto ela se afasta do centro (em vw/vh),
    //                 simulando a nuvem "desviando" da câmera
    const camadas = [
      { qtd: isMobile ? 10 : 12, tamanho: [80, 120],  opacidade: 0.5,  blur: 1.2, duracao: [55, 75], profundidade: 0.35, escalaVoo: 1.5,  distanciaVoo: 30  }, // fundo
      { qtd: isMobile ? 4: 5, tamanho: [120, 170], opacidade: 0.78, blur: 0.6, duracao: [38, 54], profundidade: 0.6,  escalaVoo: 2.6,  distanciaVoo: 60  }, // meio
      { qtd: isMobile ? 2 : 4, tamanho: [170, 230], opacidade: 1,    blur: 0,   duracao: [24, 36], profundidade: 0.9,  escalaVoo: 4.2,  distanciaVoo: 100 }  // frente
    ];

    let cloudUid = 0;

    camadas.forEach((camada) => {
      for (let i = 0; i < camada.qtd; i++) {
        cloudUid += 1;

        const wrap  = document.createElement('div');
        const cloud = document.createElement('div');

        wrap.className  = 'cloud-wrap';
        cloud.className = 'cloud';

        const { markup, ratio } = criarSvgNuvem(cloudUid);
        const size = camada.tamanho[0] + Math.random() * (camada.tamanho[1] - camada.tamanho[0]);
        const top  = 4 + Math.random() * 66;  // % — mantém as nuvens na parte de cima/meio do palco
        const left = Math.random() * 100;     // %
        const duracao = camada.duracao[0] + Math.random() * (camada.duracao[1] - camada.duracao[0]);

        wrap.style.top = `${top}%`;
        wrap.style.left = `${left}%`;
        wrap.dataset.depth = camada.profundidade.toFixed(2);

        cloud.style.width   = `${size}px`;
        cloud.style.height  = `${size * ratio}px`;
        cloud.style.opacity = camada.opacidade;
        cloud.style.filter  = camada.blur > 0
          ? `blur(${camada.blur}px) drop-shadow(0 10px 20px rgba(15,35,55,0.10))`
          : 'drop-shadow(0 10px 20px rgba(15,35,55,0.10))';
        cloud.innerHTML = markup;

        wrap.appendChild(cloud);
        layer.appendChild(wrap);

        if (hasGSAP && !prefersReduced) {
          // deriva horizontal lenta e contínua, indo e voltando
          gsap.fromTo(cloud,
            { x: -(30 + Math.random() * 40) },
            {
              x: 30 + Math.random() * 40,
              duration: duracao,
              ease: 'sine.inOut',
              repeat: -1,
              yoyo: true,
              delay: -Math.random() * duracao // começa em pontos diferentes, evita nuvens "sincronizadas"
            }
          );

          // balanço vertical bem sutil, como se estivesse boiando
          gsap.to(cloud, {
            y: 8 + Math.random() * 10,
            duration: duracao * 0.55,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            delay: -Math.random() * duracao
          });
        }

        // ---- EFEITO "VOAR ENTRE AS NUVENS" ----
        // ao rolar a intro, cada nuvem cresce e se afasta do centro
        // da tela (na direção em que ela já está), como se a câmera
        // estivesse avançando por entre elas. Perto do fim do scroll,
        // ela desaparece — como se tivesse passado por você.
        if (hasGSAP && hasST && !prefersReduced) {
          // direção: do centro da tela (50%,50%) até onde a nuvem nasceu.
          // se ela nasceu perto demais do centro, sorteia uma direção,
          // pra sempre ter pra onde "voar"
          let dirX = left - 50;
          let dirY = top - 50;
          let dist = Math.hypot(dirX, dirY);
          if (dist < 8) {
            const angulo = Math.random() * Math.PI * 2;
            dirX = Math.cos(angulo);
            dirY = Math.sin(angulo);
            dist = 1;
          }
          const normX = dirX / dist;
          const normY = dirY / dist;
          const giro = (Math.random() - 0.5) * 14; // leve rotação, dá sensação de "tombo" natural

          gsap.set(wrap, { transformOrigin: '50% 50%' });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: '.intro-wrap',
              start: 'top top',
              end: 'bottom top',
              scrub: 0.6
            }
          });

          // cresce e se afasta do centro, acelerando (power1.in imita
          // objeto que se aproxima da câmera cada vez mais rápido)
          tl.to(wrap, {
            scale: camada.escalaVoo,
            x: `${(normX * camada.distanciaVoo).toFixed(1)}vw`,
            y: `${(normY * camada.distanciaVoo).toFixed(1)}vh`,
            rotation: giro,
            ease: 'power1.in',
            duration: 1
          }, 0);

          // nos últimos 35% do scroll, some — como se já tivesse
          // passado por quem está rolando a página
          tl.to(cloud, {
            opacity: 0,
            ease: 'power1.in',
            duration: 0.35
          }, 0.65);
        }
      }
    });

    if (!hasGSAP) {
      // fallback sem GSAP: deriva simples via CSS
      layer.querySelectorAll('.cloud').forEach((cloud, i) => {
        cloud.style.animation = `floatCloud ${16 + i * 3}s ease-in-out infinite alternate`;
      });

      if (!document.getElementById('cloud-fallback-keyframes')) {
        const style = document.createElement('style');
        style.id = 'cloud-fallback-keyframes';
        style.textContent = `
          @keyframes floatCloud {
            from { transform: translate(0,0); }
            to   { transform: translate(24px,-16px); }
          }
        `;
        document.head.appendChild(style);
      }
    }
  })();


  /* =======================================================
     3. INTRO — logo/subtítulo somem enquanto o céu passa,
        e balançam suavemente junto com as nuvens
     ======================================================= */
  (function initIntro () {
    const wrap = document.querySelector('.intro-wrap');
    const sticky = document.getElementById('introSticky');
    if (!wrap || !sticky) return;

    const logo = sticky.querySelector('.intro-logo');
    const sub  = sticky.querySelector('.intro-sub');
    const cue  = sticky.querySelector('.intro-cue');

    // fade/saída ligados ao scroll (usa a propriedade "y" e "scale")
    if (hasGSAP && hasST && !prefersReduced) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5
        }
      });

      if (logo) tl.to(logo, { y: -60, opacity: 0, scale: 1.08, ease: 'none' }, 0);
      if (sub)  tl.to(sub,  { y: -30, opacity: 0, ease: 'none' }, 0);
      if (cue)  tl.to(cue,  { opacity: 0, ease: 'none' }, 0);
    }

    // balanço contínuo e independente do scroll, usando "x" (livre,
    // não é tocado pela timeline acima) pra não conflitar com o fade.
    // A mesma curva de easing e ritmo lento das nuvens dá a sensação
    // de que o texto "flutua" junto com o céu.
    if (hasGSAP && !prefersReduced) {
      if (logo) {
        gsap.to(logo, {
          x: 7,
          duration: 6,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true
        });
      }
      if (sub) {
        gsap.to(sub, {
          x: -5,
          duration: 7,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: 0.4
        });
      }
    }

    if (cue) {
      cue.style.cursor = 'pointer';
      cue.addEventListener('click', () => {
        const header = document.getElementById('header');
        if (header) header.scrollIntoView({ behavior: 'smooth' });
      });
    }
  })();


  /* =======================================================
     4. HEADER — entrada suave do conteúdo + cue de scroll
     ======================================================= */
  (function initHeader () {
    const content = document.querySelector('.header-content');
    const scrollCue = document.querySelector('.header-scroll-cue');

    if (content && hasGSAP && !prefersReduced) {
      gsap.from(content.children, {
        y: 30,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        delay: 0.15
      });
    }

    if (scrollCue) {
      scrollCue.style.cursor = 'pointer';
      scrollCue.addEventListener('click', () => {
        const produtos = document.getElementById('produtos');
        if (produtos) produtos.scrollIntoView({ behavior: 'smooth' });
      });
    }
  })();


  /* =======================================================
     5. MARQUEE — loop horizontal infinito
        (o HTML já vem com o conteúdo duplicado em 2 <span>,
        então aqui só animamos, sem duplicar de novo)
     ======================================================= */
  (function initMarquee () {
    const strip = document.querySelector('.marquee-strip');
    const track = document.getElementById('marqueeTrack');
    if (!strip || !track) return;

    if (hasGSAP && !prefersReduced) {
      const distance = track.scrollWidth / 2;

      const marqueeTween = gsap.to(track, {
        x: -distance,
        duration: Math.max(18, distance / 60),
        ease: 'none',
        repeat: -1
      });

      strip.addEventListener('mouseenter', () => marqueeTween.timeScale(0.15));
      strip.addEventListener('mouseleave', () => marqueeTween.timeScale(1));
    } else {
      track.style.animation = 'marqueeFallback 25s linear infinite';
      if (!document.getElementById('marquee-fallback-keyframes')) {
        const style = document.createElement('style');
        style.id = 'marquee-fallback-keyframes';
        style.textContent = `
          @keyframes marqueeFallback {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
        `;
        document.head.appendChild(style);
      }
    }
  })();


  /* =======================================================
     6. PRODUTOS — abre/fecha o painel de detalhes
     ======================================================= */
  (function initProdutos () {
    const btnAbrir  = document.getElementById('btnExplorar');
    const painel    = document.getElementById('produtoDetalhes');
    const btnFechar = document.getElementById('fecharPainel');
    const conteudo  = document.querySelector('.produto-conteudo');
    const pin       = document.querySelector('.produto-pin');

    if (btnAbrir && painel) {
      btnAbrir.addEventListener('click', (e) => {
        e.preventDefault();
        painel.classList.add('ativo');
      });
    }

    if (btnFechar && painel) {
      btnFechar.addEventListener('click', (e) => {
        e.preventDefault();
        painel.classList.remove('ativo');
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && painel) {
        painel.classList.remove('ativo');
      }
    });

    if (conteudo && pin && hasGSAP && hasST && !prefersReduced) {
      gsap.from(conteudo.children, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: pin,
          start: 'top 70%',
          toggleActions: 'play none none reverse'
        }
      });
    }
  })();


  /* =======================================================
     7. SOBRE — reveal (#sobreLeft / #sobreRight) e
        contador dos números (.stat-num com data-count)
     ======================================================= */
  (function initReveal () {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (hasGSAP && hasST && !prefersReduced) {
      items.forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        });
      });
    } else if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.transition = 'opacity .8s ease, transform .8s ease';
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      items.forEach((el) => io.observe(el));
    } else {
      items.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    }
  })();

  (function initStats () {
    const nums = document.querySelectorAll('.stat-num');
    if (!nums.length) return;

    nums.forEach((el) => {
      const target = parseFloat(el.dataset.count);
      if (isNaN(target)) return;

      const counter = { val: 0 };
      const renderValue = () => {
        el.textContent = Math.round(counter.val);
      };

      if (hasGSAP && hasST && !prefersReduced) {
        gsap.to(counter, {
          val: target,
          duration: 1.4,
          ease: 'power2.out',
          onUpdate: renderValue,
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none'
          }
        });
      } else {
        counter.val = target;
        renderValue();
      }
    });
  })();


  /* =======================================================
     8. CTA / FOOTER — pequena entrada
     ======================================================= */
  (function initCTA () {
    const ctaInner = document.querySelector('.cta-inner');
    if (!ctaInner || !hasGSAP || !hasST || prefersReduced) return;

    gsap.from(ctaInner.children, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: ctaInner,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });
  })();


  /* =======================================================
     9. BADGE — entrada discreta do "Feito por Void Studio"
     ======================================================= */
  (function initBadge () {
    const badge = document.getElementById('studioBadge');
    if (!badge || !hasGSAP || prefersReduced) return;

    gsap.from(badge, {
      y: 20,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      delay: 0.6
    });
  })();


/* =======================================================
   9. CHUVA CINEMATOGRÁFICA
======================================================= */

 
  const marquee = document.querySelector('.marquee-strip');

  const colors = [
    '#9f7d0da1',
    '#10ad18',
    '#035523',
    '#940ec9',
    '#b61717'
  ];

  let i = 0;

  setInterval(() => {
    marquee.style.backgroundColor = colors[i];
    i = (i + 1) % colors.length;
  }, 2000);



  
  /* =======================================================
     10. Ajustes finais ao redimensionar a janela
     ======================================================= */
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (hasST) ScrollTrigger.refresh();
    }, 200);
  });

});