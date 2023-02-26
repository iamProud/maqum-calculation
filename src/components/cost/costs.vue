<template>
    <Tile title="Kosten">
        <div>
            <Lagermodul-Table
                :data="preisliste.lagermodul"
                :fixShelfs="fixShelfs"
                :movableShelfs="movableShelfs"
                :heightExtension="heightExtension"
                :shelfSide1="shelfSide1"
                :shelfSide2="shelfSide2"
            ></Lagermodul-Table>
        </div>
    </Tile>
</template>

<script>
import preislisteJSON from "/src/assets/preisliste.json";
import LagermodulTable from "./lagermodulTable.vue";

export default {
    components: {
        "Lagermodul-Table": LagermodulTable,
    },

    props: [
        "fixShelfs",
        "movableShelfs",
        "heightExtension",
        "shelfSide1",
        "shelfSide2",
    ],

    data() {
        return {
            preisliste: preislisteJSON,
        };
    },
};
</script>

<style scoped></style>
