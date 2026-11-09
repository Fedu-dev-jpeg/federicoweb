# Federico San Lorenzo — Portfolio

Portfolio de Federico San Lorenzo: data analyst y productos digitales en Buenos Aires. La home presenta el estudio y un caso destacado; el listado completo vive en `proyectos.html`.

- 14 proyectos, mostrados solo con capturas y texto.
- Las demos **no tienen links públicos**: se muestran únicamente en una reunión. Cada proyecto lleva a la agenda de Calendly.
- Sección de freelance: diseño web, software a medida y data analytics.
- Logo: *La gran ola de Kanagawa*, de Katsushika Hokusai (dominio público).

## Cómo verlo en tu compu

Es HTML, CSS y un poco de JavaScript, sin build.

- Opción rápida: abrí `index.html` con doble clic.
- Con servidor local (recomendado):

  ```bash
  python3 -m http.server 8080
  # y abrí http://localhost:8080
  ```

## Estructura

```
index.html            inicio
proyectos.html        página exclusiva de los 14 proyectos
css/styles.css        estilos (papel #F4F3F0, tinta #111, Anton + Inter)
js/main.js            menú mobile y galería de imágenes
assets/img/projects/  capturas en WebP (900 px y hasta 1800 px)
assets/brand/         logo de la ola, favicons y tarjeta para compartir
assets/fonts/         Anton e Inter (SIL Open Font License, ver OFL-*.txt)
favicon.ico, site.webmanifest, robots.txt
```

## Publicar

Es un sitio estático: sirve tal cual en cualquier hosting estático (por ejemplo Lovable o GitHub Pages).
Cuando tenga dominio definitivo, conviene pasar `og:image` y `twitter:image` a URL absoluta y sumar `og:url` y un `sitemap.xml`.

## Contacto

- Agenda: https://calendly.com/fslcoach/30min
- Email: fslcoach@gmail.com
- LinkedIn: https://www.linkedin.com/in/federico-san-lorenzo-62186638a/
- GitHub: https://github.com/Fedu-dev-jpeg
