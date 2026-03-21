# Spike: Plugin de redimensionamiento de imágenes por arrastre (CKEditor 5)

## Objetivo

Evaluar la viabilidad de agregar redimensionamiento de imágenes arrastrando handles en el editor de templates (minutas).

---

## Hallazgos

### 1. Plugin oficial incluido en el paquete actual

El plugin **ImageResize** ya está incluido en `@ckeditor/ckeditor5-image` (v43.3.1, que ya usamos). No requiere dependencias adicionales.

```javascript
// Exports disponibles en @ckeditor/ckeditor5-image
export { default as ImageResize } from './imageresize.js';
export { default as ImageResizeButtons } from './imageresize/imageresizebuttons.js';
export { default as ImageResizeEditing } from './imageresize/imageresizeediting.js';
export { default as ImageResizeHandles } from './imageresize/imageresizehandles.js';
export { default as ImageCustomResizeUI } from './imageresize/imagecustomresizeui.js';
```

### 2. Funcionalidad que ofrece

| Método | Descripción |
|--------|-------------|
| **Resize handles** | Cuadros en las 4 esquinas de la imagen; el usuario arrastra para redimensionar |
| **Resize dropdown** | Menú en la toolbar contextual (al hacer clic en la imagen) con opciones predefinidas |
| **Resize buttons** | Botones individuales en la toolbar de imagen |

El plugin `ImageResize` incluye todo: ImageResizeEditing, ImageResizeHandles, ImageCustomResizeUI, ImageResizeButtons.

### 3. Implementación mínima (solo handles de arrastre)

```typescript
// frontend/src/ckeditor/ckeditor.ts
import { Image, ImageInsertViaUrl, ImageToolbar, ImageResize } from "@ckeditor/ckeditor5-image";

(CustomEditor as any).builtinPlugins = [
  // ... existentes ...
  Image,
  ImageInsertViaUrl,
  ImageResize,  // <-- agregar
  ImageToolbar,
];

// Config image - agregar resizeUnit opcional
image: {
  insert: { integrations: ["insertImageViaUrl"] },
  toolbar: ["imageTextAlternative"],  // opcional: agregar "resizeImage" para dropdown
  resizeUnit: "percent",  // "percent" (default) o "px"
},
```

Los handles de arrastre se habilitan automáticamente al añadir `ImageResize`; no hace falta configuración extra.

### 4. Configuración avanzada (opcional)

Si se quiere un dropdown o botones en la toolbar de la imagen:

```typescript
image: {
  resizeOptions: [
    { name: "resizeImage:original", value: null, label: "Original" },
    { name: "resizeImage:custom", value: "custom", label: "Personalizado" },
    { name: "resizeImage:40", value: "40", label: "40%" },
    { name: "resizeImage:60", value: "60", label: "60%" },
  ],
  toolbar: ["resizeImage", "imageTextAlternative"],
},
```

### 5. Markup generado

Al redimensionar, CKEditor agrega un estilo inline `width` y la clase `image_resized`:

```html
<figure class="image image_resized" style="width: 75%;">
  <img src="..." alt="...">
</figure>
```

### 6. CSS recomendado (para impresión / vista final)

Para que las imágenes redimensionadas se vean bien fuera del editor:

```css
.ck-content .image.image_resized {
  display: block;
  box-sizing: border-box;
}
.ck-content .image.image_resized img {
  width: 100%;
}
.ck-content .image.image_resized > figcaption {
  display: block;
}
```

Esto puede añadirse en los estilos de la plantilla de impresión de minutas.

### 7. Licencia

- `@ckeditor/ckeditor5-image` tiene licencia **GPL-2.0-or-later**.
- La documentación menciona `licenseKey`; para uso GPL se puede usar `licenseKey: 'GPL'`.
- No se ha confirmado si ImageResize requiere licencia premium en versiones recientes; el código está en el paquete open source.

---

## Conclusión

| Criterio | Resultado |
|----------|-----------|
| **Viabilidad técnica** | ✅ Alta – plugin oficial, ya incluido en dependencias |
| **Esfuerzo de implementación** | ⭐ Muy bajo – ~5 líneas de código |
| **Riesgo** | Bajo – plugin oficial mantenido |
| **Compatibilidad** | Compatible con setup actual (Image, ImageInsertViaUrl, ImageToolbar) |

### Recomendación

**Sí, es viable y sencillo.** Basta con añadir `ImageResize` a la lista de plugins del editor y asegurarse de que la toolbar de imagen incluya `imageTextAlternative` (y opcionalmente `resizeImage` para el dropdown).

### Próximos pasos sugeridos

1. Agregar `ImageResize` a `builtinPlugins` en `ckeditor.ts`.
2. Probar en local que los handles aparecen y el arrastre funciona.
3. Revisar que la impresión de minutas respete el `style="width: X%"` de las imágenes.
4. Añadir CSS de `image_resized` en la vista de impresión si hace falta.
