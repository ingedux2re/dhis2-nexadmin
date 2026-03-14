declare module '*.module.css' {
  const classes: { readonly [className: string]: string }
  export default classes
}
declare module '*.css' {
  const content: { readonly [className: string]: string }
  export default content
}
declare module '*.svg' {
  const src: string
  export default src
}
declare module '*.png' {
  const src: string
  export default src
}
