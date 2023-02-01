<template>
    <Tile title="Raumabmessung">
        <div class="d-grid d-xl-flex justify-content-between">
            <span>
                <label class="me-1">Länge</label>
                <input
                    type="number"
                    min="0"
                    v-model="dimensionInput.length"
                    @change="resetShelfs()"
                />
            </span>

            <span>
                <label class="me-1">Breite</label>
                <input
                    type="number"
                    min="0"
                    v-model="dimensionInput.width"
                    @change="resetShelfs()"
                />
            </span>

            <span>
                <label class="me-1">Höhe</label>
                <input type="number" min="2000" v-model="dimensionInput.height" />
            </span>

            <span>
                <label class="me-1">Einheit</label>
                <!-- Dropdown for Unit mm cm or m with default value cm -->
                <select v-model="dimensionInput.unit">
                    <option value="mm">mm</option>
                    <option value="cm">cm</option>
                    <option value="m">m</option>
                </select>
            </span>
        </div>
    </Tile>
</template>

<script>
import Tile from "./tile.vue";

export default {
    components: {
        Tile: Tile,
    },

    props: {
        dimensionInput: {
            type: Object,
            required: true,
        },
    },

    methods: {
        resetShelfs() {
            this.$emit("reset-shelfs");
        },
    },
};
</script>

<style scoped>
input[type="number"] {
    max-width: 5rem;
}
</style>
