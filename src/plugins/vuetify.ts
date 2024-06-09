import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as mdi from 'vuetify/iconsets/mdi';

// Define aliases manually if they are not exported
const aliases = {
  mdiAccount: 'mdi-account',
  // Add other aliases as needed
};

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
});

export default vuetify;
