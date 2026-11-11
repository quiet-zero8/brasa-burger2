// ===== Configuração fácil de mudar =====
// >>> TROQUE AQUI pelo número real (DDI + DDD + número, sem espaços). Este é FICTÍCIO.
// Lembre de trocar também os links wa.me no index.html.
const WHATSAPP = "5571999999999";

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

// 4. Se alguma foto não carregar, esconde a imagem quebrada (o degradê do card aparece)
document.querySelectorAll("img").forEach(img => {
  img.addEventListener("error", () => { img.style.visibility = "hidden"; });
});

// ===== V2 =====
const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// 5. Animações na rolagem: elementos aparecem ao entrar na tela (com pequeno atraso em sequência)
const alvos = document.querySelectorAll(".section__head, .card, .about__text, .features li, .quote, .contact > div, .info, .combo, .gallery figure, .faq h2, .faq details");
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

// ===== V3 · CARRINHO DE PEDIDOS =====
const brl = c => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const el = id => document.getElementById(id);
let carrinho = {}; // { id: { name, price, qty } }
try { carrinho = JSON.parse(localStorage.getItem("brasa-carrinho")) || {}; } catch (e) { carrinho = {}; }

function salva() { try { localStorage.setItem("brasa-carrinho", JSON.stringify(carrinho)); } catch (e) {} }
const itens = () => Object.entries(carrinho);
const subtotal = () => itens().reduce((t, [, i]) => t + i.price * i.qty, 0);

function desenha() {
  const lista = el("cartList");
  lista.innerHTML = "";
  itens().forEach(([id, i]) => {
    const li = document.createElement("li");
    li.className = "line";
    li.innerHTML = `<div><strong></strong><span>${brl(i.price)} cada</span></div>
      <div class="qty"><button type="button" aria-label="Diminuir">−</button><output>${i.qty}</output><button type="button" aria-label="Aumentar">+</button></div>
      <span class="line__sum">${brl(i.price * i.qty)}</span>
      <button type="button" class="line__rm" aria-label="Remover">&times;</button>`;
    li.querySelector("strong").textContent = i.name; // textContent evita injetar HTML
    const [menos, mais] = li.querySelectorAll(".qty button");
    menos.onclick = () => muda(id, -1);
    mais.onclick = () => muda(id, 1);
    li.querySelector(".line__rm").onclick = () => muda(id, -99);
    lista.appendChild(li);
  });
  const total = itens().reduce((n, [, i]) => n + i.qty, 0);
  el("cartCount").textContent = total;
  el("cartEmpty").hidden = total > 0;
  el("cartSubtotal").textContent = el("cartTotal").textContent = brl(subtotal());
  el("checkout").querySelector("button[type=submit]").disabled = total === 0;
}
function muda(id, delta) {
  if (!carrinho[id]) return;
  carrinho[id].qty += delta;
  if (carrinho[id].qty <= 0) delete carrinho[id];
  salva(); desenha();
}

// Adicionar: botões do cardápio e dos combos
document.querySelectorAll(".add").forEach(b => b.addEventListener("click", () => {
  const { id, name, price } = b.dataset;
  carrinho[id] = carrinho[id] || { name, price: Number(price), qty: 0 };
  carrinho[id].qty++;
  salva(); desenha();
  // feedback visual no botão e no contador
  const original = b.dataset.rotulo || (b.dataset.rotulo = b.textContent);
  b.textContent = "Adicionado ✓"; b.classList.add("is-added");
  const cont = el("cartCount"); cont.classList.remove("bump"); void cont.offsetWidth; cont.classList.add("bump");
  clearTimeout(b._t); b._t = setTimeout(() => { b.textContent = original; b.classList.remove("is-added"); }, 1400);
}));

// Abrir e fechar a gaveta
let foco = null;
function gaveta(abrir) {
  document.body.classList.toggle("cart-open", abrir);
  el("cart").setAttribute("aria-hidden", !abrir);
  if (abrir) { foco = document.activeElement; setTimeout(() => el("cartClose").focus(), 50); }
  else if (foco) foco.focus();
}
el("cartOpen").addEventListener("click", () => gaveta(true));
el("cartClose").addEventListener("click", () => gaveta(false));
el("overlay").addEventListener("click", () => gaveta(false));
document.addEventListener("keydown", e => { if (e.key === "Escape" && document.body.classList.contains("cart-open")) gaveta(false); });

// Finalizar: monta a mensagem e abre o WhatsApp
el("checkout").addEventListener("submit", e => {
  e.preventDefault();
  const nome = el("cliente").value.trim();
  if (!nome) { el("cartErro").textContent = "Informe seu nome para finalizar."; el("cliente").focus(); return; }
  el("cartErro").textContent = "";
  const modo = document.querySelector("input[name=modo]:checked").value;
  const linhas = itens().map(([, i]) => `• ${i.qty}x ${i.name} (${brl(i.price * i.qty)})`);
  let msg = `Olá! Sou ${nome} e quero fazer um pedido na Brasa Burger:\n\n${linhas.join("\n")}\n\nSubtotal: ${brl(subtotal())}\nRecebimento: ${modo}`;
  const obs = el("obs").value.trim();
  if (obs) msg += `\nObservações: ${obs}`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
});
desenha();
