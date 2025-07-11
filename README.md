# @samhammer/TipToB

TipTap ToolBox (TipToB)
================================

TipToB is a customizable, web component-based toolbox for [TipTap](https://tiptap.dev/). It provides a set of ready-to-use Svelte web components and extensions for building modern, flexible, and framework-agnostic rich text editing experiences.

---

## ✨ Features

- **Web Components**: Use editor buttons and menus as custom elements in any framework or plain HTML.
- **TipTap Extensions**: Includes a set of TipTap extensions for advanced editing features.
- **Svelte-based**: All UI components are written in Svelte for performance and reactivity.
- **Customizable**: Easily style and extend the toolbox to fit your needs.

---

## 🚀 Installation

```sh
npm install @samhammer/tiptob
```

---

## 🛠️ Usage

### Using Web Components

Import the web components bundle in your application:

```js
import '@samhammer/tiptob/web-components.js';
```

You can now use the provided custom elements in your HTML:

```html
<tiptob-bold-button></tiptob-bold-button>
<tiptob-italic-button></tiptob-italic-button>
<tiptob-underline-button></tiptob-underline-button>
<!-- ...and more -->
```

### Using Extensions

Import the extensions bundle to use with your TipTap editor instance:

```js
import { ImageExtension, KnowledgeExtension, SelectionDecoration, TableBubbleMenuExtension } from '@samhammer/tiptob/extensions.js';
```

---

## 🧩 Components

TipToB provides the following web components:

- `<tiptob-bold-button>`
- `<tiptob-italic-button>`
- `<tiptob-underline-button>`
- `<tiptob-bullet-list-button>`
- `<tiptob-ordered-list-button>`
- `<tiptob-font-color-button>`
- `<tiptob-font-highlight-button>`
- `<tiptob-image-button>`
- `<tiptob-knowledge-button>`
- `<tiptob-redo-button>`
- `<tiptob-undo-button>`
- `<tiptob-remove-format-button>`
- `<tiptob-strike-button>`
- `<tiptob-hyperlink-button>`
- `<tiptob-table-button>`
- `<tiptob-table-bubble-menu>`
- `<tiptob-text-align-button>`

---

## 🧩 Extensions

- **ImageExtension**: Add image support to your editor. You need to bind a function that uploads the File to your choosen FileProvider, the function receives a `File` and returns a `Promise<string>`. Example:
  ```js
  uploadInlineImage(file: File): Promise<string>;
  ```
- **SelectionDecoration**: Visual selection highlighting.
- **TableBubbleMenuExtension**: Bubble Menu for table editing support.

---

## ⚡ Simple TipTap Editor Example

Below is a minimal example of initializing a TipTap editor. For more advanced usage and configuration, see the [TipTap documentation](https://tiptap.dev/):

```js
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import {
  ImageExtension,
  SelectionDecoration,
  TableBubbleMenuExtension
} from '@samhammer/tiptob/extensions.js';

const editor = new Editor({
  element: document.querySelector('#editor'),
  extensions: [
    StarterKit,
    ImageExtension,
    SelectionDecoration,
    TableBubbleMenuExtension
  ],
  content: '<p>Hello World!</p>',
});
```

```html
<div id="editor"></div>
```

For more details and advanced configuration, visit the [TipTap documentation](https://tiptap.dev/).

---

## 🔗 Binding the Editor Instance to Web Components (Plain JavaScript)

TipToB web components require a TipTap editor instance to function. Some components, like the image upload button, also require a callback function for uploading images that returns a string (the image URL). Here is how you can do this in plain JavaScript (example for bold, italic, and image upload buttons):

```js
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import { ImageExtension } from '@samhammer/tiptob/extensions.js';

// Example image upload function (should return a Promise<string> with the image URL)
function uploadInlineImage(file) {
  // Replace this with your actual upload logic
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate upload and return a dummy URL
      resolve('https://your.cdn.com/' + file.name);
    }, 1000);
  });
}

const editor = new Editor({
  element: document.querySelector('#editor'),
  extensions: [
    StarterKit,
    Bold,
    Italic,
    ImageExtension(uploadInlineImage)
  ],
  content: '<p>Hello World!</p>',
});

// Assign the editor instance to each TipToB custom element
const boldButton = document.querySelector('tiptob-bold-button');
boldButton.editor = editor;

const italicButton = document.querySelector('tiptob-italic-button');
italicButton.editor = editor;

const imageButton = document.querySelector('tiptob-image-button');
imageButton.editor = editor;
imageButton.imageUpload = uploadInlineImage;
```

```html
<script type="module" src="@samhammer/tiptob/web-components.js"></script>

<div id="editor"></div>
<tiptob-bold-button></tiptob-bold-button>
<tiptob-italic-button></tiptob-italic-button>
<tiptob-image-button></tiptob-image-button>
```

> **Note:** For components like `<tiptob-image-button>`, you must provide an `imageUpload` function that returns a Promise resolving to the image URL.

---

## 🎨 Styling

TipToB components use CSS custom properties for easy theming. The following variables can be overwritten:

```css
:root {
  --tiptob-bg-button: white;
  --tiptob-bg-button-hover: #e2e2e2;
  --tiptob-bg-button-highlighted: #a6ccf7;
  --tiptob-bg-icon: rgba(37, 39, 45, 0.37);
}
```

---

## 📄 License

MIT © Samhammer AG
