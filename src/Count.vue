<template>
  <v-app>
    <v-main>
      <v-container>
        <v-data-table
          :headers="headers"
          :items="items"
          class="elevation-1"
        >
          <template v-slot:item.renew="{ item }">
            <v-btn color="primary" @click="renewPermit(item.id)">Renew</v-btn>
          </template>
        </v-data-table>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';

const headers = [
  { text: 'Id', value: 'id' },
  { text: 'Title', value: 'title' },
  { text: 'Permit Raised', value: 'permitRaised' },
  { text: 'Permit Expiry', value: 'permitExpiry' },
  { text: 'Days Left', value: 'daysLeft' },
  { text: 'Renew', value: 'renew', sortable: false },
];

const items = ref([
  { id: 1, title: 'Permit A', permitRaised: '2024-01-01', permitExpiry: '2024-06-01', daysLeft: 10 },
  { id: 2, title: 'Permit B', permitRaised: '2024-02-01', permitExpiry: '2024-07-01', daysLeft: 20 },
  { id: 3, title: 'Permit C', permitRaised: '2024-03-01', permitExpiry: '2024-08-01', daysLeft: 30 },
  { id: 4, title: 'Permit D', permitRaised: '2024-04-01', permitExpiry: '2024-09-01', daysLeft: 40 },
]);

const renewPermit = (id) => {
  alert(`Renew permit with ID: ${id}`);
};
</script>

<style scoped>
/* Your styles */
</style>