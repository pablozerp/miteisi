export const LOCAL_DOCS = [
  {
    slug: 'python-introduccion',
    title: 'Introducción a Python',
    urlMatches: ['docs.python.org'],
    summary: 'Lenguaje fácil de leer y escribir, ideal para aprendizaje, automatización y ciencia de datos.',
    html: `
      <h1>Introducción a Python</h1>
      <p>Python es un lenguaje de programación de alto nivel, fácil de leer y escribir. Es ideal para aprendizaje, automatización, ciencia de datos y desarrollo web.</p>
      <h2>Instalación</h2>
      <p>Descarga Python desde la web oficial y configura tu entorno. Puedes usar Visual Studio Code o PyCharm para comenzar.</p>
      <h2>Primer programa</h2>
      <pre><code>print('Hola Mundo')</code></pre>
      <h2>Recursos</h2>
      <ul>
        <li>Instalación y entorno</li>
        <li>Sintaxis básica</li>
        <li>Estructuras de control</li>
      </ul>
    `,
  },
  {
    slug: 'javascript-introduccion',
    title: 'Introducción a JavaScript',
    urlMatches: ['developer.mozilla.org'],
    summary: 'Lenguaje del navegador y backend con Node.js, perfecto para interactividad web.',
    html: `
      <h1>Introducción a JavaScript</h1>
      <p>JavaScript es el lenguaje de programación que permite interactividad en el navegador y también se usa en el backend con Node.js.</p>
      <h2>Conceptos básicos</h2>
      <p>Variables, funciones, eventos y manipulación del DOM son las bases para empezar.</p>
      <h2>Ejemplo</h2>
      <pre><code>const saludo = 'Hola Mundo'; console.log(saludo);</code></pre>
      <h2>Recursos</h2>
      <ul>
        <li>Variables y tipos</li>
        <li>Funciones</li>
        <li>Eventos y DOM</li>
      </ul>
    `,
  },
  {
    slug: 'cpp-introduccion',
    title: 'Introducción a C++',
    urlMatches: ['isocpp.org', 'cplusplus.com', 'cppreference.com'],
    summary: 'Lenguaje compilado orientado a alto rendimiento, usado en sistemas y aplicaciones avanzadas.',
    html: `
      <h1>Introducción a C++</h1>
      <p>C++ es un lenguaje compilado, potente para desarrollo de sistemas y aplicaciones de alto rendimiento.</p>
      <h2>Compilación</h2>
      <p>Escribe un programa, compílalo con GCC o Clang y ejecuta el binario.</p>
      <pre><code>#include &lt;iostream&gt;
using namespace std;
int main() {
  cout << "Hola Mundo" << endl;
  return 0;
}</code></pre>
      <h2>Recursos</h2>
      <ul>
        <li>Tipos básicos</li>
        <li>Funciones</li>
        <li>POO en C++</li>
      </ul>
    `,
  },
  {
    slug: 'java-introduccion',
    title: 'Introducción a Java',
    urlMatches: ['oracle.com', 'docs.oracle.com'],
    summary: 'Lenguaje orientado a objetos popular en empresas y aplicaciones móviles.',
    html: `
      <h1>Introducción a Java</h1>
      <p>Java es un lenguaje orientado a objetos muy usado en aplicaciones empresariales y móviles.</p>
      <h2>Hola Mundo</h2>
      <pre><code>public class HolaMundo {
  public static void main(String[] args) {
    System.out.println("Hola Mundo");
  }
}</code></pre>
      <h2>Recursos</h2>
      <ul>
        <li>Clases y objetos</li>
        <li>Herencia</li>
        <li>Manejo de excepciones</li>
      </ul>
    `,
  },
  {
    slug: 'go-introduccion',
    title: 'Introducción a Go',
    urlMatches: ['go.dev'],
    summary: 'Lenguaje moderno y sencillo, ideal para servidores y herramientas de red.',
    html: `
      <h1>Introducción a Go</h1>
      <p>Go es un lenguaje moderno creado por Google, ideal para servidores y herramientas de red.</p>
      <h2>Hola Mundo</h2>
      <pre><code>package main

import "fmt"

func main() {
  fmt.Println("Hola Mundo")
}</code></pre>
      <h2>Recursos</h2>
      <ul>
        <li>Paquetes</li>
        <li>Funciones</li>
        <li>Concurrencia sencilla</li>
      </ul>
    `,
  },
  {
    slug: 'rust-introduccion',
    title: 'Introducción a Rust',
    urlMatches: ['rust-lang.org'],
    summary: 'Lenguaje de sistemas seguro y de alto rendimiento, ideal para proyectos robustos.',
    html: `
      <h1>Introducción a Rust</h1>
      <p>Rust es un lenguaje de sistemas que prioriza seguridad de memoria y rendimiento.</p>
      <h2>Hola Mundo</h2>
      <pre><code>fn main() {
  println!("Hola Mundo");
}</code></pre>
      <h2>Recursos</h2>
      <ul>
        <li>Propiedad y préstamos</li>
        <li>Tipos de datos</li>
        <li>Gestión segura de memoria</li>
      </ul>
    `,
  },
];

export const getLocalDocSlug = (url) => {
  if (!url) return null;
  const normalized = url.toLowerCase();
  const doc = LOCAL_DOCS.find((item) =>
    item.urlMatches.some((match) => normalized.includes(match))
  );
  return doc?.slug || null;
};

export const getLocalDoc = (slug) => LOCAL_DOCS.find((item) => item.slug === slug) || null;

export const getLocalDocByUrl = (url) => {
  if (!url) return null;
  const normalized = url.toLowerCase();
  return LOCAL_DOCS.find((item) =>
    item.urlMatches.some((match) => normalized.includes(match))
  ) || null;
};
