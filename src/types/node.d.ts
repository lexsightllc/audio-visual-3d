// Type definitions for Node.js
// Reference: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/node

// This file is used to help TypeScript understand Node.js types in a Vite project
// The actual types are provided by @types/node package

// This empty declaration file is a workaround to make TypeScript happy
// The actual types are loaded from node_modules/@types/node

declare module 'node:*' {
  import * as node from 'node:*';
  export = node;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.less' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.styl' {
  const classes: { [key: string]: string };
  export default classes;
}
