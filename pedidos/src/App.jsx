import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import {
  branches,
  catalogLastSyncedAt,
  getCategoryLabel,
  getCategoriesForBranch,
  getEmpanadaFlavors,
  getBranch,
  getProduct,
  getProductsForBranch,
} from "../shared/catalog.mjs";

import { createOrder, createPayment, getOrderStatus } from "./lib/api.js";

const money = new Intl.NumberFormat("es-AR", {
  style: "currency",

  currency: "ARS",

  maximumFractionDigits: 0,
});

const SAVED_ADDRESS_KEY = "cn-last-address";
const CONFIGURED_CART_KEY = "cn-configured-cart";

const wait = (milliseconds) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const ORDER_STATUS_LABELS = {
  awaiting_payment: "Esperando el pago",
  payment_pending: "Validando el pago",
  paid: "Pago aprobado",
  payment_rejected: "Pago rechazado",
  payment_expired: "Pago vencido",
  sent_to_branch: "Enviado al local",
  received: "Recibido por el local",
  preparing: "En preparación",
  ready: "Listo",
  out_for_delivery: "En camino",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

function orderStatusLabel(status) {
  return ORDER_STATUS_LABELS[status] || "Pedido creado";
}

function readConfiguredCart() {
  try {
    const value = JSON.parse(localStorage.getItem(CONFIGURED_CART_KEY) || "[]");
    return Array.isArray(value)
      ? value.filter((item) => getProduct(item?.productId))
      : [];
  } catch {
    return [];
  }
}

function formatFlavorSummary(configuration) {
  return (configuration?.selections || [])
    .map((selection) => `${selection.quantity}× ${selection.name}`)
    .join(" · ");
}

function readSavedAddress() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_ADDRESS_KEY) || "null");
  } catch {
    return null;
  }
}

function normalizeWhatsAppNumber(value) {
  return String(value || "").replace(/\D/g, "");
}

function getPaymentStatus(payment) {
  const status = payment?.status || "unknown";
  const labels = {
    approved: "✅ Aprobado",
    pending: "⏳ Pendiente",
    rejected: "❌ Rechazado",
    canceled: "🚫 Cancelado",
    expired: "⌛ Vencido",
  };

  return {
    label: labels[status] || "⚠️ Sin confirmar",
    approved: status === "approved",
  };
}

function buildWhatsAppMessage(order, payment, isTest) {
  const deliveryLabel =
    order.fulfillment === "delivery" ? "Delivery" : "Retiro en el local";
  const paymentStatus = getPaymentStatus(payment);
  const paymentProvider =
    payment?.provider === "mock" ? "Nave (simulado)" : "Nave";
  const lines = [
    isTest
      ? "🧪 *PEDIDO DE PRUEBA — NO PREPARAR*"
      : paymentStatus.approved
        ? "🟢 *NUEVO PEDIDO WEB — PAGO APROBADO*"
        : "🟠 *PEDIDO WEB — PAGO SIN CONFIRMAR*",
    "",
    `*Pedido:* ${order.id}`,
    `*Sucursal:* ${order.branch.name}`,
    `*Cliente:* ${order.customer.name}`,
    `*Teléfono:* ${order.customer.phone}`,
    "",
    "*Detalle:*",
    ...order.items.flatMap((item) => {
      const itemLine =
        `• ${item.quantity}x ${item.name} — ${money.format(item.lineTotal)}`;
      const flavors = formatFlavorSummary(item.configuration);
      return flavors ? [itemLine, `  Sabores: ${flavors}`] : [itemLine];
    }),
    "",
    `*Entrega:* ${deliveryLabel}`,
  ];

  if (order.fulfillment === "delivery" && order.address) {
    lines.push(`*Dirección:* ${order.address.street}, ${order.address.city}`);
  }

  if (order.notes) lines.push(`*Notas:* ${order.notes}`);

  lines.push(
    "",
    `*Total:* ${money.format(order.total)}`,
    `*Pago:* ${paymentStatus.label}`,
    `*Medio:* ${paymentProvider}`,
  );

  if (!isTest && !paymentStatus.approved) {
    lines.push("", "⚠️ *NO PREPARAR HASTA CONFIRMAR EL PAGO*");
  }

  return lines.join("\n");
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

function ProductCard({ product, quantity, configuredCount, onAdd, onDecrease, onConfigure }) {
  const isConfigurable = Boolean(product.configurationType);

  return (
    <article className="product-card">
      <div className="product-card__image">
        <img src={product.image} alt={product.name} loading="lazy" />

        <span>{product.badge}</span>
      </div>

      <div className="product-card__body">
        <div>
          <p>
            {getCategoryLabel(product.category)}
          </p>

          <h3>{product.name}</h3>
        </div>

        <p className="product-card__description">{product.description}</p>

        <div className="product-card__footer">
          <strong>{money.format(product.price)}</strong>

          {isConfigurable ? (
            <button className="add-button add-button--configure" type="button" onClick={onConfigure}>
              {configuredCount > 0 ? `Armar otra (${configuredCount})` : "Elegir sabores"}
              <span>+</span>
            </button>
          ) : quantity > 0 ? (
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

function FlavorSelector({ product, flavors, onClose, onConfirm }) {
  const [selection, setSelection] = useState({});
  const selectedCount = Object.values(selection).reduce(
    (sum, quantity) => sum + quantity,
    0,
  );
  const remaining = product.selectionCount - selectedCount;

  function changeFlavor(productId, change) {
    setSelection((current) => {
      const currentValue = current[productId] || 0;
      if (change > 0 && selectedCount >= product.selectionCount) return current;

      const nextValue = Math.max(0, currentValue + change);
      const next = { ...current };
      if (nextValue === 0) delete next[productId];
      else next[productId] = nextValue;
      return next;
    });
  }

  function confirm() {
    if (selectedCount !== product.selectionCount) return;

    const selections = Object.entries(selection).map(([productId, quantity]) => ({
      productId,
      name: getProduct(productId).name,
      quantity,
    }));

    onConfirm({
      id: `${product.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      productId: product.id,
      quantity: 1,
      configuration: {
        type: product.configurationType,
        selections,
      },
    });
  }

  return (
    <div className="modal-backdrop flavor-backdrop" role="presentation">
      <section
        className="flavor-selector"
        role="dialog"
        aria-modal="true"
        aria-labelledby="flavor-selector-title"
      >
        <header className="flavor-selector__header">
          <div>
            <span className="eyebrow">Armá tu elección</span>
            <h2 id="flavor-selector-title">{product.name}</h2>
            <p>Podés combinar sabores clásicos y gourmet.</p>
          </div>

          <button className="icon-close" type="button" onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </button>
        </header>

        <div className={`flavor-progress ${remaining === 0 ? "is-complete" : ""}`}>
          <div>
            <strong>{selectedCount} de {product.selectionCount}</strong>
            <span>{remaining === 0 ? "¡Lista para agregar!" : `Faltan ${remaining}`}</span>
          </div>
          <div className="flavor-progress__track">
            <span style={{ width: `${(selectedCount / product.selectionCount) * 100}%` }} />
          </div>
        </div>

        <div className="flavor-list">
          {flavors.map((flavor) => {
            const quantity = selection[flavor.id] || 0;
            return (
              <article className={quantity > 0 ? "is-selected" : ""} key={flavor.id}>
                <img src={flavor.image} alt="" />
                <div>
                  <small>{flavor.category === "gourmet" ? "Gourmet" : "Clásica"}</small>
                  <strong>{flavor.name}</strong>
                </div>
                <QuantityControl
                  value={quantity}
                  onDecrease={() => changeFlavor(flavor.id, -1)}
                  onIncrease={() => changeFlavor(flavor.id, 1)}
                  compact
                />
              </article>
            );
          })}
        </div>

        <footer className="flavor-selector__footer">
          <small>Elegí exactamente {product.selectionCount} empanadas.</small>
          <button
            className="primary-button"
            type="button"
            disabled={selectedCount !== product.selectionCount}
            onClick={confirm}
          >
            {remaining === 0 ? `Agregar por ${money.format(product.price)}` : `Elegí ${remaining} más`}
          </button>
        </footer>
      </section>
    </div>
  );
}

function CartDrawer({
  open,
  cart,
  configuredItems,
  branch,
  onClose,
  onAdd,
  onDecrease,
  onRemoveConfigured,
  onCheckout,
}) {
  const cartItems = Object.entries(cart)

    .map(([productId, quantity]) => ({
      product: getProduct(productId),
      quantity,
    }))

    .filter((item) => item.product && item.quantity > 0);

  const simpleSubtotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,

    0,
  );
  const configuredSubtotal = configuredItems.reduce((total, item) => {
    const product = getProduct(item.productId);
    return total + (product?.price || 0);
  }, 0);
  const subtotal = simpleSubtotal + configuredSubtotal;
  const isEmpty = cartItems.length === 0 && configuredItems.length === 0;

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

        {isEmpty ? (
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

              {configuredItems.map((item) => {
                const product = getProduct(item.productId);
                return (
                  <article className="cart-item cart-item--configured" key={item.id}>
                    <img src={product.image} alt="" />

                    <div>
                      <h3>{product.name}</h3>
                      <span className="cart-item__flavors">
                        {formatFlavorSummary(item.configuration)}
                      </span>
                      <button
                        className="remove-configured"
                        type="button"
                        onClick={() => onRemoveConfigured(item.id)}
                      >
                        Quitar
                      </button>
                    </div>

                    <strong>{money.format(product.price)}</strong>
                  </article>
                );
              })}
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

function PaymentProgress({ step }) {
  const steps = [
    { id: "creating_order", label: "Guardando tu pedido" },
    { id: "opening_payment", label: "Conectando el pago" },
    { id: "confirming", label: "Confirmando la aprobación" },
  ];
  const activeIndex = Math.max(
    0,
    steps.findIndex((item) => item.id === step),
  );

  return createPortal(
    <div className="payment-progress" role="status" aria-live="polite">
      <div className="payment-progress__glow" aria-hidden="true" />
      <section>
        <div className="payment-progress__brand">
          <img src="/assets/brand/cosa-nostra-monograma.png" alt="" />
          <span className="payment-progress__spinner" aria-hidden="true" />
        </div>

        <span className="eyebrow">Pedido protegido</span>
        <h2>{steps[activeIndex].label}…</h2>
        <p>No cierres esta pantalla. Estamos verificando cada paso.</p>

        <div className="payment-progress__steps">
          {steps.map((item, index) => (
            <div
              className={`${index < activeIndex ? "is-done" : ""} ${index === activeIndex ? "is-active" : ""}`}
              key={item.id}
            >
              <span>{index < activeIndex ? "✓" : index + 1}</span>
              <strong>{item.label}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>,
    document.body,
  );
}

function Checkout({ cart, configuredItems, branch, onBack, onSuccess }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const [fulfillment, setFulfillment] = useState("delivery");

  const [loading, setLoading] = useState(false);

  const [paymentStep, setPaymentStep] = useState("creating_order");

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

  const simpleItems = Object.entries(cart)

    .filter(([, quantity]) => quantity > 0)

    .map(([productId, quantity]) => ({ productId, quantity }));

  const configuredOrderItems = configuredItems.map((item) => ({
    id: item.id,
    productId: item.productId,
    quantity: 1,
    configuration: item.configuration,
  }));

  const items = [...simpleItems, ...configuredOrderItems];

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

    setPaymentStep("creating_order");

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

      setPaymentStep("opening_payment");

      await wait(450);

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

      setPaymentStep("confirming");

      await wait(850);

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
      {loading && <PaymentProgress step={paymentStep} />}

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
                <div className="review-item" key={item.id || `${item.productId}-${formatFlavorSummary(item.configuration)}`}>
                  <span>
                    {item.quantity}× {product.name}
                    {item.configuration && (
                      <small>{formatFlavorSummary(item.configuration)}</small>
                    )}
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
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const [copyLabel, setCopyLabel] = useState("Copiar pedido");
  const [livePayment, setLivePayment] = useState(result.payment);
  const [liveOrderStatus, setLiveOrderStatus] = useState(
    result.payment.orderStatus ||
      (result.payment.status === "approved" ? "paid" : result.order.status),
  );

  useEffect(() => {
    if (result.order.mode === "mock") return undefined;

    let cancelled = false;
    let timerId;
    let attempts = 0;

    async function refreshStatus() {
      try {
        const status = await getOrderStatus(result.order.id);
        if (cancelled) return;

        setLiveOrderStatus(status.status);
        setLivePayment((current) => ({
          ...current,
          status: status.paymentStatus,
        }));

        attempts += 1;
        if (
          attempts < 40 &&
          !["delivered", "cancelled", "payment_rejected", "payment_expired"].includes(
            status.status,
          )
        ) {
          timerId = window.setTimeout(refreshStatus, 3000);
        }
      } catch {
        attempts += 1;
        if (!cancelled && attempts < 8) {
          timerId = window.setTimeout(refreshStatus, 4000);
        }
      }
    }

    refreshStatus();
    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [result.order.id, result.order.mode]);

  const selectedBranch = getBranch(result.order.branch.id);
  const testNumber = normalizeWhatsAppNumber(
    import.meta.env.VITE_WHATSAPP_TEST_NUMBER,
  );
  const branchNumber = normalizeWhatsAppNumber(selectedBranch?.whatsapp);
  const whatsappNumber = testNumber || branchNumber;
  const isWhatsAppTest =
    Boolean(testNumber) || result.order.mode !== "production";
  const paymentStatus = getPaymentStatus(livePayment);
  const whatsappMessage = buildWhatsAppMessage(
    result.order,
    livePayment,
    isWhatsAppTest,
  );
  const whatsappUrl = whatsappNumber && paymentStatus.approved
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
    : "";

  async function copyOrder() {
    try {
      await navigator.clipboard.writeText(whatsappMessage);
      setCopyLabel("Pedido copiado ✓");
      window.setTimeout(() => setCopyLabel("Copiar pedido"), 2200);
    } catch {
      setCopyLabel("No se pudo copiar");
    }
  }

  return (
    <main
      className={`success-page ${paymentStatus.approved ? "is-approved" : "is-pending"}`}
      aria-live="polite"
    >
      <div className="success-orbit success-orbit--one" aria-hidden="true" />
      <div className="success-orbit success-orbit--two" aria-hidden="true" />
      <div className="success-burst" aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => <i key={index} />)}
      </div>

      <img src="/assets/brand/cosa-nostra-monograma.png" alt="Cosa Nostra" />

      <div className="success-check">✓</div>

      <span className="eyebrow">
        {paymentStatus.approved ? "Pago aprobado" : "Pago recibido"}
      </span>

      <h1>
        {paymentStatus.approved
          ? "¡Listo! Tu pedido quedó creado."
          : "Tu pedido quedó pendiente."}
      </h1>

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
          {paymentStatus.label}
          {livePayment.provider === "mock" ? " · Simulado" : " · Nave"}
        </strong>

        <span>Pedido</span>
        <strong>{orderStatusLabel(liveOrderStatus)}</strong>
      </div>

      <div className="whatsapp-panel">
        <strong>
          {paymentStatus.approved
            ? "Enviar el pedido al local"
            : "Esperando confirmación del pago"}
        </strong>
        <p>
          {paymentStatus.approved
            ? "WhatsApp abrirá el mensaje completo. Revisalo y presioná Enviar para terminar la prueba."
            : "El envío al local se habilita únicamente cuando el servidor confirma el pago."}
        </p>

        <div className="whatsapp-actions">
          {whatsappUrl ? (
            <a
              className="whatsapp-button"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              Abrir WhatsApp
            </a>
          ) : paymentStatus.approved ? (
            <span className="whatsapp-missing">
              Falta configurar el número de prueba.
            </span>
          ) : (
            <span className="whatsapp-missing whatsapp-missing--waiting">
              Validando el pago…
            </span>
          )}

          <button
            className="copy-order-button"
            type="button"
            onClick={copyOrder}
            disabled={!paymentStatus.approved}
          >
            {copyLabel}
          </button>
        </div>

        {isWhatsAppTest && (
          <small>
            Modo prueba activo: el local no debe preparar este pedido.
          </small>
        )}
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

  const [configureProduct, setConfigureProduct] = useState(null);

  const [configuredItems, setConfiguredItems] = useState(readConfiguredCart);

  const [cart, setCart] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("cn-cart") || "{}");
      return Object.fromEntries(
        Object.entries(saved).filter(
          ([productId, quantity]) => getProduct(productId) && Number(quantity) > 0,
        ),
      );
    } catch {
      return {};
    }
  });

  const branch = getBranch(branchId) || branches[0];
  const activeProducts = useMemo(
    () => getProductsForBranch(branch.id),
    [branch.id],
  );
  const activeCategories = useMemo(
    () => getCategoriesForBranch(branch.id),
    [branch.id],
  );
  const activeEmpanadaFlavors = useMemo(
    () => getEmpanadaFlavors(branch.id),
    [branch.id],
  );

  const simpleCartCount = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0,
  );
  const cartCount = simpleCartCount + configuredItems.length;

  const simpleCartSubtotal = Object.entries(cart).reduce(
    (total, [productId, quantity]) => {
      const product = getProduct(productId);

      return total + (product ? product.price * quantity : 0);
    },
    0,
  );
  const configuredCartSubtotal = configuredItems.reduce((total, item) => {
    const product = getProduct(item.productId);
    return total + (product?.price || 0);
  }, 0);
  const cartSubtotal = simpleCartSubtotal + configuredCartSubtotal;

  const filteredProducts = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase("es");

    return activeProducts.filter((product) => {
      const matchesCategory =
        category === "todos" || product.category === category;

      const matchesSearch =
        !normalized ||
        `${product.name} ${product.description}`
          .toLocaleLowerCase("es")
          .includes(normalized);

      return matchesCategory && matchesSearch;
    });
  }, [activeProducts, category, search]);

  useEffect(() => {
    localStorage.setItem("cn-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(CONFIGURED_CART_KEY, JSON.stringify(configuredItems));
  }, [configuredItems]);

  useEffect(() => {
    if (!activeCategories.some((item) => item.id === category)) {
      setCategory("todos");
    }
  }, [activeCategories, category]);

  function chooseBranch(id) {
    if (branchId && branchId !== id && cartCount > 0) {
      setCart({});
      setConfiguredItems([]);
    }

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

    setConfiguredItems([]);
  }

  if (result) {
    return <Success result={result} onRestart={() => setResult(null)} />;
  }

  if (checkoutOpen) {
    return (
      <Checkout
        cart={cart}

        configuredItems={configuredItems}

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
              <span className="eyebrow">Carta de {branch.name}</span>

              <h2>Eso que ya estás imaginando.</h2>

              <p>
                Elegí por categoría. Carta sincronizada con el menú actual el
                {` ${new Date(`${catalogLastSyncedAt}T12:00:00`).toLocaleDateString("es-AR")}`}.
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
            {activeCategories.map((item) => (
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

                  configuredCount={configuredItems.filter((item) => item.productId === product.id).length}

                  onAdd={() => add(product.id)}

                  onDecrease={() => decrease(product.id)}

                  onConfigure={() => setConfigureProduct(product)}
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

        configuredItems={configuredItems}

        branch={branch}

        onClose={() => setCartOpen(false)}

        onAdd={add}

        onDecrease={decrease}

        onRemoveConfigured={(id) =>
          setConfiguredItems((current) => current.filter((item) => item.id !== id))
        }

        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {configureProduct && (
        <FlavorSelector
          product={configureProduct}

          flavors={activeEmpanadaFlavors}
          onClose={() => setConfigureProduct(null)}
          onConfirm={(item) => {
            setConfiguredItems((current) => [...current, item]);
            setConfigureProduct(null);
            setCartOpen(true);
          }}
        />
      )}

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
