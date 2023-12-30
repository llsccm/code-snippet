export default {
  plugins: ['stylelint-order', 'stylelint-config-rational-order/plugin'],
  extends: ['stylelint-config-standard', 'stylelint-config-rational-order'],
  rules: {
    'order/properties-order': [],
    'color-function-notation': 'legacy'
  }
}