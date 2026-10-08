import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent registra AppRegistry.registerComponent('main', () => App);
// Además deja el entorno listo tanto en Expo Go como en una build nativa
registerRootComponent(App);
