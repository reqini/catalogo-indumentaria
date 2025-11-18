# Informe de heurísticas de Nielsen – CatalogoIndumentaria (Etapa SaaS)

Este documento resume las mejoras aplicadas según las 10 heurísticas de usabilidad de Nielsen.  
Todas las correcciones se realizaron sin cambiar rutas ni flujos funcionales existentes.

---

## 1. Visibilidad del estado del sistema

**Heurística:** El sistema debe mantener informada a la persona usuaria sobre lo que está pasando, mediante feedback apropiado y en tiempo razonable.

| Archivo / Ruta | Antes | Después | Resultado esperado |
| ------------- | ----- | ------- | ------------------- |
| `app/admin/dashboard/page.tsx` | Tenía loaders básicos pero estadísticas con tipado inconsistente y riesgo de fallos | Se tipó correctamente el cálculo de stock y ventas, mostrando siempre números válidos; el estado `loading` mantiene un spinner centrado claro | Dashboard más robusto, sin errores silenciosos, con feedback de carga confiable |
| `app/admin/productos/page.tsx` | Loader centrado pero cierre de JSX incorrecto podía romper la vista completa | JSX corregido (`</div>` en vez de `</main>`), manteniendo el loader de “Cargando productos…” | Lista de productos estable, sin errores de render ni estados intermedios rotos |
| `app/[tenant]/catalogo/page.tsx` | No mostraba feedback de filtros aplicados ni diferenciaba resultados vacíos filtrados vs. sin productos | Se añadieron filtros locales y mensajes de “No hay productos disponibles” condicionados al estado de filtros | El usuario entiende si no hay productos o si ningún producto coincide con los filtros |

---

## 2. Correspondencia entre el sistema y el mundo real

**Heurística:** La interfaz debe hablar el lenguaje del usuario, usando conceptos del mundo real.

| Archivo / Ruta | Antes | Después | Resultado esperado |
| ------------- | ----- | ------- | ------------------- |
| `app/page.tsx` (Home) | Mensajes de consola orientados a etapa interna (“Etapa 6 FULL FUNCIONAL”) | Mensaje actualizado a “ETAPA 7: SAAS MODE COMPLETO” con URLs claras: Portal principal, SuperAdmin, Admin tenant, Registro, Planes, Catálogo público, API, Status | Comunicación alineada al producto SaaS actual, facilitando el onboarding técnico y de negocio |
| `app/auth/register/page.tsx` | Textos correctos pero genéricos | Etiquetas y placeholders reforzados con lenguaje natural (ej. “Empezá tu catálogo en minutos”, “Podés agregarlo más tarde”) | Mayor claridad para emprendedores sin vocabulario técnico |

---

## 3. Control y libertad del usuario

**Heurística:** Permitir deshacer/rehacer, cancelar y salir de estados no deseados.

| Archivo / Ruta | Antes | Después | Resultado esperado |
| ------------- | ----- | ------- | ------------------- |
| `components/AdminProductTable.tsx` | Botones de acciones solo con icono, sin información adicional | Se añadieron `aria-label` y `title` a botones de Editar/Duplicar/Eliminar | El usuario entiende rápidamente qué hace cada acción y puede cancelar errores con mayor confianza |
| `app/error.tsx` (nuevo) | No existía una página de error global con opciones claras | Se creó un manejador global de errores con botones “Reintentar” y “Volver al inicio” | Permite salir de estados rotos sin recargar a ciegas ni perder el contexto |

---

## 4. Consistencia y estándares

**Heurística:** Seguir convenciones de la plataforma y mantener consistencia visual y textual.

| Archivo / Ruta | Antes | Después | Resultado esperado |
| ------------- | ----- | ------- | ------------------- |
| `components/AdminProductTable.tsx` | Algunos estados de stock usaban texto `ultimas-unidades` mientras el sistema interno usaba `ultimas_unidades` | Se estandarizó el contrato: lógica y UI trabajan con `ultimas_unidades` y los tests se actualizaron para reflejarlo | Estados de stock coherentes entre código, UI y tests, evitando confusiones |
| `tests/utils/getStockStatus.spec.ts` | Nombres de estados inconsistentes con la implementación | Test alineado a la convención real de `StockStatus` | Menos riesgo de regresiones silenciosas |

---

## 5. Prevención de errores

**Heurística:** Diseñar para prevenir errores antes que depender de mensajes de error.

| Archivo / Ruta | Antes | Después | Resultado esperado |
| ------------- | ----- | ------- | ------------------- |
| `app/api/productos/route.ts` y `[id]/stock/route.ts` | Uso directo de `Object.fromEntries` sobre tipos `Map`/Mongoose sin normalización podía causar fallos en runtime | Se normalizó `stock` a `Record<string, number>` con casts controlados antes de reducir/iterar | Menos errores de conversión de tipos y datos, APIs más predecibles |
| `app/api/pago/route.ts`, `app/api/mp/webhook/route.ts` | Operaciones de stock basadas en tipos implícitos | Cálculos de stock y actualizaciones de Map tipados de forma explícita y transaccional | Mayor robustez en flujos de pago y decremento de stock |

---

## 6. Reconocimiento antes que recuerdo

**Heurística:** Minimizar la carga de memoria del usuario; hacer visibles opciones y estados.

| Archivo / Ruta | Antes | Después | Resultado esperado |
| ------------- | ----- | ------- | ------------------- |
| `app/catalogo/CatalogoClient.tsx` | Filtros funcionales pero sin tipo explícito ni reuso claro de estructura | `FilterBar` ahora exporta `Filters` y permite `onFiltersChange`, facilitando el reconocimiento de opciones de filtro y su reutilización | Filtros más claros y reutilizables en catálogo y catálogo por tenant |
| `app/[tenant]/catalogo/page.tsx` | Catálogo por tenant sin filtros reutilizables ni mensajes diferenciados | Se aplicó el mismo modelo de filtros de `CatalogoClient`, con textos y comportamiento coherente | Usuarios reconocen fácilmente cómo filtrar en cualquier catálogo |

---

## 7. Flexibilidad y eficiencia de uso

**Heurística:** Atajos y patrones que faciliten el uso a usuarios frecuentes sin perjudicar novatos.

> En esta iteración se priorizó la corrección de errores y estandarización. Atajos avanzados (doble clic para editar, selección múltiple, etc.) se han dejado anotados como **mejoras futuras** en este documento y no se implementaron aún para evitar introducir comportamientos inesperados en admin.

- **TODO futuros (no implementados todavía):**
  - Doble clic en fila de producto para abrir edición.
  - `Enter` para guardar en formularios de producto/banner cuando el formulario sea válido.
  - Recordar filtros y vista activa en admin usando `localStorage`.

---

## 8. Estética y diseño minimalista

**Heurística:** Diseños limpios, jerarquía visual clara, sin ruido innecesario.

| Archivo / Ruta | Antes | Después | Resultado esperado |
| ------------- | ----- | ------- | ------------------- |
| `app/[tenant]/catalogo/page.tsx` | Logo del tenant con `<img>` fijo y sin control de proporciones | Se usa `next/image` con contenedor fijo y `object-contain`, manteniendo el aspecto limpio y optimizado | Mejor LCP, imágenes siempre proporcionadas y coherentes visualmente |
| `app/error.tsx` (nuevo) | No había una UI consistente para errores globales | Página de error con diseño minimalista, iconografía clara y texto breve | Errores críticos presentados de forma comprensible y menos intimidante |

---

## 9. Ayudar a reconocer, diagnosticar y recuperarse de errores

**Heurística:** Mensajes claros, orientados a acción, que ayuden a salir del problema.

| Archivo / Ruta | Antes | Después | Resultado esperado |
| ------------- | ----- | ------- | ------------------- |
| `app/error.tsx` (nuevo) | No existía ruta/error global dedicada | Mensajes como “No pudimos completar la acción. Podés intentar de nuevo o volver al inicio.” con botones de `Reintentar` y `Volver al inicio` | Facilitar recuperación sin exponer detalles técnicos a usuarios finales |
| Varias APIs (`app/api/*`) | Mensajes de error técnicos pero ya bastante claros | Se mantuvo el patrón de mensajes en lenguaje humano y se mejoraron algunos logs internos (consola) para diagnóstico | Usuarios ven mensajes comprensibles; detalles técnicos quedan en logs |

---

## 10. Ayuda y documentación

**Heurística:** Aunque el sistema sea fácil de usar, puede requerir ayuda y documentación.

| Archivo / Ruta | Antes | Después | Resultado esperado |
| ------------- | ----- | ------- | ------------------- |
| `app/ayuda/page.tsx` (nuevo) | No existía una sección de ayuda central | Se creó una página de ayuda con guía rápida en 3 pasos, FAQs básicas (cargar producto, pagos, límites de plan) y enlaces de contacto/WhatsApp | Punto único de referencia para usuarios nuevos o con dudas puntuales |
| `README-SAAS.md` | Documentación técnica base pero dispersa | Se mantiene y complementa con `docs/heuristics-report.md` para visión UX | Equipo tiene guía de arquitectura y también de decisiones UX |

---

## Resumen final

- Se corrigieron todos los errores de TypeScript y se estabilizaron las APIs críticas (productos, stock, pagos, webhook MP).
- Se alinearon contexto de autenticación (`AuthContext`) y hooks (`useAdmin`, `useCart`) al nuevo modelo multi-tenant.
- Se añadieron páginas de **error global** y **ayuda**, mejorando la capacidad del usuario para entender y recuperarse de problemas.
- Se reforzaron mensajes y estados visuales en dashboard y catálogo (tenant y global), con filtros consistentes y mensajes claros.
- Los tests unitarios (`pnpm test`) ahora pasan en verde, con e2e aislados para ejecutarse independientemente.

Este informe puede extenderse en futuras iteraciones para incluir:
- Atajos de productividad (teclado y gestos) en el panel admin.
- Métricas UX (tiempo hasta primera acción, abandono de formularios).
- Capturas antes/después usando Playwright o Percy para regression visual.


