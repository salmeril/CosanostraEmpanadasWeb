import { useEffect, useMemo, useState } from "react";

import {
  branches,
  categories,
  products,
  getBranch,
  getProduct,
} from "../shared/catalog.mjs";

import { createOrder, createPayment } from "./lib/api.js";

const money = new Intl.NumberFormat("es-AR", {
  style: "currency",

  currency: "ARS",

  maximumFractionDigits: 0,
});

const SAVED_ADDRESS_KEY = "cn-last-address";

function readSavedAddress() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_ADDRESS_KEY) || "null");
  } catch {
    return null;
  }
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 8.5h14l-1 12H6l-1-12Z" />

      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function BranchPicker({ selectedId, onSelect, onClose, required = false }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="branch-picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="branch-picker-title"
      >
        {!required && (
          <button
            className="icon-close"
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <CloseIcon />
          </button>
        )}

        <span className="eyebrow">Primero elegimos el local</span>

        <h2 id="branch-picker-title">¿Desde qué Cosa Nostra vas a pedir?</h2>

        <p>
          El menú, los tiempos y el costo de entrega pueden cambiar según la
          sucursal.
        </p>

        <div className="branch-picker__grid">
          {branches.map((branch, index) => (
            <button
              className={`branch-choice ${selectedId === branch.id ? "is-active" : ""}`}

              type="button"

              key={branch.id}

              onClick={() => onSelect(branch.id)}
            >
              <img src={branch.image} alt="" />

              <span className="branch-choice__index">0{index + 1}</span>

              <span className="branch-choice__copy">
                <strong>{branch.name}</strong>

                <small>{branch.shortAddress}</small>
              </span>

              <ArrowIcon />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function QuantityControl({ value, onDecrease, onIncrease, compact = false }) {
  return (
    <div
      className={`quantity ${compact ? "quantity--compact" : ""}`}
      aria-label={`Cantidad: ${value}`}
    >
      <button type="button" onClick={onDecrease} aria-label="Restar uno">
        −
      </button>

      <strong>{value}</strong>

      <button type="button" onClick={onIncrease} aria-label="Sumar uno">
        +
      </button>
    </div>
  );
}

function ProductCard({ product, quantity, onAdd, onDecrease }) {
  return (
    <article className="product-card">
      <div className="product-card__image">
        <img src={product.image} alt={product.name} loading="lazy" />

        <span>{product.badge}</span>
      </div>

      <div className="product-card__body">
        <div>
          <p>
            {product.category === "gourmet"
              ? "Empanada gourmet"
              : product.category}
          </p>

          <h3>{product.name}</h3>
        </div>

        <p className="product-card__description">{product.description}</p>

        <div className="product-card__footer">
          <strong>{money.format(product.price)}</strong>

          {quantity > 0 ? (
            <QuantityControl
              value={quantity}

              onDecrease={onDecrease}

              onIncrease={onAdd}

              compact
            />
          ) : (
            <button className="add-button" type="button" onClick={onAdd}>
              Agregar <span>+</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function CartDrawer({
  open,
  cart,
  branch,
  onClose,
  onAdd,
  onDecrease,
  onCheckout,
}) {
  const cartItems = Object.entries(cart)

    .map(([productId, quantity]) => ({
      product: getProduct(productId),
      quantity,
    }))

    .filter((item) => item.product && item.quantity > 0);

  const subtotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,

    0,
  );

  return (
    <>
      <button
        className={`drawer-scrim ${open ? "is-open" : ""}`}

        type="button"

        onClick={onClose}

        aria-label="Cerrar carrito"
      />

      <aside
        className={`cart-drawer ${open ? "is-open" : ""}`}
        aria-hidden={!open}
      >
        <header>
          <div>
            <span className="eyebrow">Tu pedido</span>

            <h2>Carrito</h2>
          </div>

          <button
            className="icon-close"
            type="button"
            onClick={onClose}
            aria-label="Cerrar carrito"
          >
            <CloseIcon />
          </button>
        </header>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <BagIcon />

            <h3>Todavía no agregaste nada.</h3>

            <p>Elegí algo rico del menú y va a aparecer acá.</p>

            <button type="button" onClick={onClose}>
              Ver el menú
            </button>
          </div>
        ) : (
          <>
            <div className="cart-branch">
              <span>Sale desde</span>

              <strong>{branch.name}</strong>

              <small>{branch.shortAddress}</small>
            </div>

            <div className="cart-items">
              {cartItems.map(({ product, quantity }) => (
                <article className="cart-item" key={product.id}>
                  <img src={product.image} alt="" />

                  <div>
                    <h3>{product.name}</h3>

                    <span>{money.format(product.price)} c/u</span>

                    <QuantityControl
                      value={quantity}

                      onDecrease={() => onDecrease(product.id)}

                      onIncrease={() => onAdd(product.id)}

                      compact
                    />
                  </div>

                  <strong>{money.format(product.price * quantity)}</strong>
                </article>
              ))}
            </div>

            <footer className="cart-summary">
              <div>
                <span>Subtotal</span>
                <strong>{money.format(subtotal)}</strong>
              </div>

              <small>El envío se calcula al elegir entrega o retiro.</small>

              <button
                className="primary-button"
                type="button"
                onClick={onCheckout}
              >
                Continuar pedido <ArrowIcon />
              </button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}

function Checkout({ cart, branch, onBack, onSuccess }) {
  const [fulfillment, setFulfillment] = useState("delivery");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [savedAddress] = useState(readSavedAddress);

  const [rememberAddress, setRememberAddress] = useState(Boolean(savedAddress));

  const [form, setForm] = useState({
    name: "",

    phone: "",

    email: "",

    street: savedAddress?.street || "",

    city: savedAddress?.city || "",

    notes: "",
  });

  const items = Object.entries(cart)

    .filter(([, quantity]) => quantity > 0)

    .map(([productId, quantity]) => ({ productId, quantity }));

  const subtotal = items.reduce(
    (total, item) => total + getProduct(item.productId).price * item.quantity,

    0,
  );

  const deliveryFee = fulfillment === "delivery" ? branch.deliveryFee : 0;

  const total = subtotal + deliveryFee;

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  async function submit(event) {
    event.preventDefault();

    setLoading(true);

    setError("");

    try {
      const order = await createOrder({
        branchId: branch.id,

        items,

        fulfillment,

        customer: {
          name: form.name.trim(),

          phone: form.phone.trim(),

          email: form.email.trim(),
        },

        address:
          fulfillment === "delivery"
            ? { street: form.street.trim(), city: form.city.trim() }
            : null,

        notes: form.notes.trim(),
      });

      if (fulfillment === "delivery" && rememberAddress) {
        localStorage.setItem(
          SAVED_ADDRESS_KEY,
          JSON.stringify({
            street: form.street.trim(),
            city: form.city.trim(),
          }),
        );
      } else if (!rememberAddress) {
        localStorage.removeItem(SAVED_ADDRESS_KEY);
      }

      const payment = await createPayment(order);

      onSuccess({ order, payment });
    } catch (submitError) {
      setError(
        submitError.message || "No pudimos crear el pedido. Probá nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="checkout-page">
      <button className="back-button" type="button" onClick={onBack}>
        ← Volver al menú
      </button>

      <div className="checkout-layout">
        <section>
          <span className="eyebrow">Último paso</span>

          <h1>¿Cómo te entregamos lo rico?</h1>

          <p>
            Completá tus datos. Esta versión trabaja en modo prueba y no realiza
            cobros reales.
          </p>

          <form className="checkout-form" onSubmit={submit}>
            <fieldset className="delivery-choice">
              <legend>Forma de entrega</legend>

              <label className={fulfillment === "delivery" ? "is-active" : ""}>
                <input
                  type="radio"

                  name="fulfillment"

                  value="delivery"

                  checked={fulfillment === "delivery"}

                  onChange={() => setFulfillment("delivery")}
                />

                <strong>Delivery</strong>

                <small>Envío demo: {money.format(branch.deliveryFee)}</small>
              </label>

              <label className={fulfillment === "pickup" ? "is-active" : ""}>
                <input
                  type="radio"

                  name="fulfillment"

                  value="pickup"

                  checked={fulfillment === "pickup"}

                  onChange={() => setFulfillment("pickup")}
                />

                <strong>Retiro en local</strong>

                <small>{branch.shortAddress}</small>
              </label>
            </fieldset>

            <div className="form-grid">
              <label>
                <span>Nombre y apellido *</span>

                <input
                  value={form.name}
                  onChange={update("name")}
                  required
                  autoComplete="name"
                />
              </label>

              <label>
                <span>Teléfono *</span>

                <input
                  value={form.phone}
                  onChange={update("phone")}
                  required
                  inputMode="tel"
                  autoComplete="tel"
                />
              </label>

              <label className="form-wide">
                <span>Email *</span>

                <input
                  value={form.email}
                  onChange={update("email")}
                  required
                  type="email"
                  autoComplete="email"
                />
              </label>

              {fulfillment === "delivery" && (
                <>
                  <label>
                    <span>Dirección *</span>

                    <input
                      value={form.street}
                      onChange={update("street")}
                      required
                      autoComplete="street-address"
                    />
                  </label>

                  <label>
                    <span>Localidad *</span>

                    <input
                      value={form.city}
                      onChange={update("city")}
                      required
                      autoComplete="address-level2"
                    />
                  </label>

                  <label className="remember-address form-wide">
                    <input
                      type="checkbox"

                      checked={rememberAddress}

                      onChange={(event) =>
                        setRememberAddress(event.target.checked)
                      }
                    />

                    <span>Recordar esta dirección en este dispositivo</span>
                  </label>
                </>
              )}

              <label className="form-wide">
                <span>Notas para el pedido</span>

                <textarea
                  value={form.notes}
                  onChange={update("notes")}
                  rows="4"
                  placeholder="Timbre, piso, aclaraciones…"
                />
              </label>
            </div>

            <div className="payment-preview">
              <span>Medio de pago</span>

              <strong>Nave · entorno de prueba</strong>

              <p>
                En la integración real, Nave abrirá su checkout seguro y
                devolverá el resultado del pago.
              </p>
            </div>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <button
              className="primary-button checkout-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creando pedido…"
                : `Probar pago · ${money.format(total)}`}

              {!loading && <ArrowIcon />}
            </button>
          </form>
        </section>

        <aside className="order-review">
          <span className="eyebrow">Resumen</span>

          <h2>{branch.name}</h2>

          <div className="review-items">
            {items.map((item) => {
              const product = getProduct(item.productId);

              return (
                <div key={item.productId}>
                  <span>
                    {item.quantity}× {product.name}
                  </span>

                  <strong>{money.format(product.price * item.quantity)}</strong>
                </div>
              );
            })}
          </div>

          <div className="review-total">
            <div>
              <span>Subtotal</span>
              <strong>{money.format(subtotal)}</strong>
            </div>

            <div>
              <span>{fulfillment === "delivery" ? "Envío" : "Retiro"}</span>
              <strong>{money.format(deliveryFee)}</strong>
            </div>

            <div className="review-total__final">
              <span>Total demo</span>
              <strong>{money.format(total)}</strong>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Success({ result, onRestart }) {
  return (
    <main className="success-page">
      <img src="/assets/brand/cosa-nostra-monograma.png" alt="Cosa Nostra" />

      <div className="success-check">✓</div>

      <span className="eyebrow">Simulación completada</span>

      <h1>El pedido de prueba quedó creado.</h1>

      <p>
        Código <strong>{result.order.id}</strong>. En producción, esta pantalla
        aparecerá únicamente después de recibir la confirmación válida del pago.
      </p>

      <div className="success-data">
        <span>Sucursal</span>
        <strong>{result.order.branch.name}</strong>

        <span>Total</span>
        <strong>{money.format(result.order.total)}</strong>

        <span>Pago</span>
        <strong>
          {result.payment.provider === "mock" ? "Nave simulado" : "Nave"}
        </strong>
      </div>

      <button className="primary-button" type="button" onClick={onRestart}>
        Crear otro pedido
      </button>
    </main>
  );
}

export default function App() {
  const [branchId, setBranchId] = useState(
    () => localStorage.getItem("cn-branch") || "",
  );

  const [pickerOpen, setPickerOpen] = useState(!branchId);

  const [category, setCategory] = useState("todos");

  const [search, setSearch] = useState("");

  const [cartOpen, setCartOpen] = useState(false);

  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [result, setResult] = useState(null);

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cn-cart") || "{}");
    } catch {
      return {};
    }
  });

  const branch = getBranch(branchId) || branches[0];

  const cartCount = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0,
  );

  const cartSubtotal = Object.entries(cart).reduce(
    (total, [productId, quantity]) => {
      const product = getProduct(productId);

      return total + (product ? product.price * quantity : 0);
    },
    0,
  );

  const filteredProducts = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase("es");

    return products.filter((product) => {
      const matchesCategory =
        category === "todos" || product.category === category;

      const matchesSearch =
        !normalized ||
        `${product.name} ${product.description}`
          .toLocaleLowerCase("es")
          .includes(normalized);

      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  useEffect(() => {
    localStorage.setItem("cn-cart", JSON.stringify(cart));
  }, [cart]);

  function chooseBranch(id) {
    if (branchId && branchId !== id && cartCount > 0) setCart({});

    setBranchId(id);

    localStorage.setItem("cn-branch", id);

    setPickerOpen(false);
  }

  function add(productId) {
    setCart((current) => ({
      ...current,
      [productId]: (current[productId] || 0) + 1,
    }));
  }

  function decrease(productId) {
    setCart((current) => {
      const next = { ...current };

      if ((next[productId] || 0) <= 1) delete next[productId];
      else next[productId] -= 1;

      return next;
    });
  }

  function finishCheckout(nextResult) {
    setResult(nextResult);

    setCheckoutOpen(false);

    setCartOpen(false);

    setCart({});
  }

  if (result) {
    return <Success result={result} onRestart={() => setResult(null)} />;
  }

  if (checkoutOpen) {
    return (
      <Checkout
        cart={cart}

        branch={branch}

        onBack={() => setCheckoutOpen(false)}

        onSuccess={finishCheckout}
      />
    );
  }

  return (
    <div className="app-shell">
      <div className="test-banner">
        <span>Fase 2 · entorno de prueba</span>

        <strong>No procesa cobros reales</strong>
      </div>

      <header className="site-header">
        <a href="#inicio" aria-label="Cosa Nostra, inicio">
          <img
            src="/assets/brand/cosa-nostra-horizontal.png"
            alt="Cosa Nostra"
          />
        </a>

        <button
          className="header-branch"
          type="button"
          onClick={() => setPickerOpen(true)}
        >
          <span>Estás pidiendo en</span>

          <strong>{branchId ? branch.name : "Elegí sucursal"}</strong>
        </button>

        <button
          className="header-cart"
          type="button"
          onClick={() => setCartOpen(true)}
        >
          <BagIcon />

          <span>Tu pedido</span>

          <strong>{cartCount}</strong>
        </button>
      </header>

      <main id="inicio">
        <section className="menu-hero">
          <img src={branch.image} alt={`Sucursal Cosa Nostra ${branch.name}`} />

          <div className="menu-hero__veil" />

          <div className="menu-hero__copy">
            <span className="eyebrow">Una cosa nostra, a tu manera</span>

            <h1>
              Elegí. Sumá. <em>Disfrutá.</em>
            </h1>

            <p>Armá tu pedido directo con la sucursal que tenés más cerca.</p>

            <button
              type="button"
              onClick={() =>
                document
                  .querySelector("#menu")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Ver el menú <ArrowIcon />
            </button>
          </div>

          <div className="menu-hero__status">
            <span className="status-dot" />

            <div>
              <strong>{branch.name}</strong>
              <small>{branch.shortAddress}</small>
            </div>

            <button type="button" onClick={() => setPickerOpen(true)}>
              Cambiar
            </button>
          </div>
        </section>

        <section className="menu-section" id="menu">
          <div className="menu-heading">
            <div>
              <span className="eyebrow">Menú de prueba</span>

              <h2>Eso que ya estás imaginando.</h2>

              <p>
                Productos y precios cargados para validar la experiencia. Antes
                de producción se reemplazan por el menú definitivo.
              </p>
            </div>

            <label className="search-field">
              <span>Buscar</span>

              <input
                type="search"

                value={search}

                onChange={(event) => setSearch(event.target.value)}

                placeholder="¿Qué se te antoja?"
              />
            </label>
          </div>

          <div className="category-tabs" aria-label="Categorías del menú">
            {categories.map((item) => (
              <button
                className={category === item.id ? "is-active" : ""}

                type="button"

                key={item.id}

                onClick={() => setCategory(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}

                  product={product}

                  quantity={cart[product.id] || 0}

                  onAdd={() => add(product.id)}

                  onDecrease={() => decrease(product.id)}
                />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <h3>No encontramos ese sabor.</h3>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("todos");
                }}
              >
                Ver todo el menú
              </button>
            </div>
          )}
        </section>

        <section className="how-it-works">
          <span className="eyebrow">Directo, simple y nuestro</span>

          <h2>Del antojo a tu mesa.</h2>

          <div>
            <article>
              <span>01</span>
              <h3>Elegís el local</h3>
              <p>El menú y la entrega se ajustan a tu sucursal.</p>
            </article>

            <article>
              <span>02</span>
              <h3>Armás el pedido</h3>
              <p>Sumás productos, cantidades y tus indicaciones.</p>
            </article>

            <article>
              <span>03</span>
              <h3>Pagás seguro</h3>
              <p>Nave procesa el pago fuera del navegador de Cosa Nostra.</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <img src="/assets/brand/cosa-nostra-monograma.png" alt="" />

        <div>
          <strong>Cosa Nostra Empanadas</strong>
          <span>Hechas a lo grande.</span>
        </div>

        <p>Prototipo funcional · Fase 2</p>
      </footer>

      {cartCount > 0 && !cartOpen && (
        <button
          className="floating-cart"
          type="button"
          onClick={() => setCartOpen(true)}
        >
          <span>{cartCount}</span>

          <strong>Ver pedido</strong>

          <b>{money.format(cartSubtotal)}</b>
        </button>
      )}

      <CartDrawer
        open={cartOpen}

        cart={cart}

        branch={branch}

        onClose={() => setCartOpen(false)}

        onAdd={add}

        onDecrease={decrease}

        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {pickerOpen && (
        <BranchPicker
          selectedId={branchId}

          onSelect={chooseBranch}

          onClose={() => setPickerOpen(false)}

          required={!branchId}
        />
      )}
    </div>
  );
}