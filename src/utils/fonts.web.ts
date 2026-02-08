/**
 * Web-specific font loading - uses @font-face to avoid
 * @react-native/assets-registry dependency that breaks web bundling
 */
export const loadFonts = async (): Promise<void> => {
  if (typeof document === 'undefined') return;

  const fontBasePath = '/assets/fonts';

  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'Vazirmatn-Regular';
      src: url('${fontBasePath}/Vazir.woff2') format('woff2'),
           url('${fontBasePath}/Vazir.woff') format('woff'),
           url('${fontBasePath}/Vazir.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    @font-face {
      font-family: 'Vazirmatn-Bold';
      src: url('${fontBasePath}/Vazir-Bold.woff2') format('woff2'),
           url('${fontBasePath}/Vazir-Bold.woff') format('woff'),
           url('${fontBasePath}/Vazir-Bold.ttf') format('truetype');
      font-weight: bold;
      font-style: normal;
    }
    @font-face {
      font-family: 'Estedad-Regular';
      src: url('${fontBasePath}/Vazir.woff2') format('woff2'),
           url('${fontBasePath}/Vazir.woff') format('woff'),
           url('${fontBasePath}/Vazir.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    @font-face {
      font-family: 'Estedad-Bold';
      src: url('${fontBasePath}/Vazir-Bold.woff2') format('woff2'),
           url('${fontBasePath}/Vazir-Bold.woff') format('woff'),
           url('${fontBasePath}/Vazir-Bold.ttf') format('truetype');
      font-weight: bold;
      font-style: normal;
    }
  `;
  document.head.appendChild(style);

  // Wait for fonts to be ready
  if (document.fonts?.load) {
    await document.fonts.load('16px Vazirmatn-Regular');
    await document.fonts.load('16px Vazirmatn-Bold');
  }
};
