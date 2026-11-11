// ===== Configuração fácil de mudar =====
const WHATSAPP = "5571999999999"; // DDI + DDD + número (fictício)

// 1. O header fica sólido depois que a página rola
const header = document.getElementById("header");
const atualizaHeader = () => header.classList.toggle("is-solid", window.scrollY > 40);
atualizaHeader();
window.addEventListener("scroll", atualizaHeader, { passive: true });

// 2. Menu do celular (abre e fecha)
const botaoMenu = document.getElementById("menuToggle");
const nav = document.getElementById("nav");
function alternaMenu(abrir) {
  nav.classList.toggle("is-open", abrir);
  botaoMenu.setAttribute("aria-expanded", abrir);
}
botaoMenu.addEventListener("click", () => alternaMenu(!nav.classList.contains("is-open")));
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => alternaMenu(false)));

// 3. Botões "Pedir": abrem o WhatsApp já com o nome do item
document.querySelectorAll(".order").forEach(botao => {
  const msg = `Olá! Quero pedir: ${botao.dataset.item}.`;
  botao.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  botao.target = "_blank";
  botao.rel = "noopener";
});

// 4. Se alguma foto não carregar, esconde a imagem quebrada (o degradê do card aparece)
document.querySelectorAll("img").forEach(img => {
  img.addEventListener("error", () => { img.style.visibility = "hidden"; });
});

// ===== V2 =====
const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// 5. Animações na rolagem: elementos aparecem ao entrar na tela (com pequeno atraso em sequência)
const alvos = document.querySelectorAll(".section__head, .card, .about__text, .features li, .quote, .contact > div, .info");
alvos.forEach((el, i) => {
  el.classList.add("reveal");
  el.style.setProperty("--d", `${(i % 4) * 0.08}s`);
});
if (reduzMovimento || !("IntersectionObserver" in window)) {
  alvos.forEach(el => el.classList.add("is-visible"));
} else {
  const observador = new IntersectionObserver((itens) => {
    itens.forEach(item => {
      if (item.isIntersecting) { item.target.classList.add("is-visible"); observador.unobserve(item.target); }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  alvos.forEach(el => observador.observe(el));
}

// 6. Botão flutuante do WhatsApp aparece depois da rolagem
const botaoWpp = document.querySelector(".wpp");
const atualizaWpp = () => botaoWpp.classList.toggle("is-on", window.scrollY > 400);
atualizaWpp();
window.addEventListener("scroll", atualizaWpp, { passive: true });

// 7. Menu destaca a seção que está na tela
const ligacoes = [...document.querySelectorAll(".nav a:not(.btn)")];
const secoes = ligacoes.map(a => document.querySelector(a.getAttribute("href")));
const destaque = () => {
  const ponto = window.scrollY + window.innerHeight * 0.35;
  let atual = null;
  secoes.forEach((s, i) => { if (s && s.offsetTop <= ponto) atual = i; });
  ligacoes.forEach((a, i) => a.classList.toggle("is-active", i === atual));
};
destaque();
window.addEventListener("scroll", destaque, { passive: true });
