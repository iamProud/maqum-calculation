<template>
    <header>
        <h2 class="text-center m-3">Maschinen Kalkulation</h2>
    </header>

    <main class="container-fluid row">
        <div class="col-6">
            <Dimensions :dimension-input="dimensionInput"></Dimensions>

            <Implementation
                class="w-100"
                :einlagerungsmodul="einlagerungsmodul"
                :height="dimension.height"
                :shelfSide1="shelfSide1"
                :shelfSide2="shelfSide2"
                @einlagerungsmodul-side-change="changeSide($event)"
                @einlagerungsmodul-position-change="changePosition($event)"
                @einlagerungsmodul-typ-change="changeType($event)"
                @height-extension-change="heightExtension = $event"
            >
            </Implementation>

            <Matrix
                class=""
                :dimension="dimension"
                :einlagerungsmodul="einlagerungsmodul"
                :einlagerungsmodulSize="einlagerungsmodulSize"
                :bauteile="bauteile"
                :shelfSide1="shelfSide1"
                :shelfSide2="shelfSide2"
                @select-side-1="setShelfSide1($event)"
                @select-side-2="setShelfSide2($event)"
            ></Matrix>
        </div>

        <div class="col-6">
            <Preview
                :length="dimension.length"
                :width="dimension.width"
                :bauteile="bauteile"
                :heightExtension="heightExtension"
                :mashineDimensions="mashineDimensions"
                :shelfSide1="shelfSide1"
                :shelfSide2="shelfSide2"
                :einlagerungsmodul="einlagerungsmodul"
                @fix-shelfs-calculation="fixShelfs = $event"
                @movable-shelfs-calculation="movableShelfs = $event"
            ></Preview>
        </div>

        <Debugger
            v-if="debug"
            title="Debug"
            :dimension="dimension"
            :mashineDimensions="mashineDimensions"
            :einlagerungsmodulSize="einlagerungsmodulSize"
        ></Debugger>

        <Costs
            :fixShelfs="fixShelfs"
            :movableShelfs="movableShelfs"
            :heightExtension="heightExtension"
            :shelfSide1="shelfSide1"
            :shelfSide2="shelfSide2"
        ></Costs>
    </main>
</template>

<script>
import Preview from "./components/preview.vue";
import Implementation from "./components/implementation.vue";
import Matrix from "./components/matrix.vue";
import bauteileJSON from "/src/assets/bauteile.json";
import Costs from "./components/cost/costs.vue";
import Dimensions from "./components/dimensions.vue";
import Debugger from "./components/debugger.vue";

export default {
    components: {
        Dimensions: Dimensions,
        Preview: Preview,
        Matrix: Matrix,
        Implementation: Implementation,
        Costs: Costs,
        Debugger: Debugger,
    },

    data() {
        return {
            debug: true,

            bauteile: bauteileJSON,

            // Dimension in mm
            dimension: {
                length: 0,
                width: 0,
                height: 0,
            },

            // Dimension in selected unit
            dimensionInput: {
                length: 0,
                width: 0,
                height: 0,
                unit: "cm",
            },

            einlagerungsmodul: {
                position: "left",
                side: "short",
                type: "n10",
            },

            heightExtension: 0,

            shelfSide1: { rows: 0, shelf: null },
            shelfSide2: { rows: 0, shelf: null },

            fixShelfs: { 25: 0, 35: 0 },
            movableShelfs: { 25: 0, 35: 0 },

            unit: {
                mm: 1,
                cm: 10,
                m: 1000,
            },
        };
    },

    watch: {
        // watch for changes in dimensionInput.unit
        "dimensionInput.unit": function (newUnit, oldUnit) {
            // convert old dimension to new unit
            for (let key in this.dimensionInput) {
                if (key == "unit") continue;

                // calculate dimesion based on unit
                this.dimensionInput[key] =
                    this.dimensionInput[key] *
                    (this.unit[oldUnit] / this.unit[newUnit]);
            }
        },

        dimensionInput: {
            handler: function (newDimension) {
                // multiply each dimension
                for (let key in newDimension) {
                    if (key == "unit") continue;

                    // calculate dimesion based on unit
                    this.dimension[key] =
                        newDimension[key] * this.unit[newDimension.unit];
                }
            },
            deep: true,
        },
    },

    methods: {
        changeSide(newSide) {
            this.einlagerungsmodul.side = newSide;
        },

        changePosition(newPosition) {
            this.einlagerungsmodul.position = newPosition;
        },

        changeType(newType) {
            this.einlagerungsmodul.type = newType;
        },

        setShelfSide1(event) {
            this.shelfSide1 = event;
            this.shelfSide2 = { rows: 0, shelf: null };
        },

        setShelfSide2(event) {
            this.shelfSide2 = event;
        },

        resetShelfs() {
            this.shelfSide1 = { rows: 0, shelf: null };
            this.shelfSide2 = { rows: 0, shelf: null };
        },
    },

    computed: {
        einlagerungsmodulSize() {
            let einlagerungsmodulWidth = this.bauteile.picksystem.width;
            let einlagerungsmodulDepth = Math.max(
                this.bauteile.picksystem.depth,
                this.bauteile.kistenaufzug.depth
            );

            if (this.einlagerungsmodul.type == "n10") {
                einlagerungsmodulWidth += this.bauteile.kistenaufzug.width;
            }

            if (this.einlagerungsmodul.type == "n20") {
                einlagerungsmodulWidth += 2 * this.bauteile.kistenaufzug.width;
            }

            return {
                width: einlagerungsmodulWidth,
                depth: einlagerungsmodulDepth,
            };
        },

        mashineDimensions() {
            var side1Length = 0;
            var side2Length = 0;
            var side1Width = 0;
            var side2Width = 0;
            var fullWidth = 0;

            if (this.einlagerungsmodul.side == "short") {
                side1Length =
                    this.shelfSide1.rows * this.bauteile.lagerregal.width +
                    Math.max(
                        this.bauteile.kistenaufzug.depth,
                        this.bauteile.picksystem.depth
                    );

                side2Length =
                    this.shelfSide2.rows * this.bauteile.lagerregal.width +
                    Math.max(
                        this.bauteile.kistenaufzug.depth,
                        this.bauteile.picksystem.depth
                    );

                if (this.shelfSide1.shelf != null) {
                    side1Width = this.shelfSide1.shelf.fullSize;
                }

                if (this.shelfSide2.shelf != null) {
                    side2Width = this.shelfSide2.shelf.fullSize;
                }

                let kistenaufzug2width =
                    this.einlagerungsmodul.type == "n20"
                        ? this.bauteile.kistenaufzug.width
                        : 0;
                let side1maxWidth = Math.max(
                    side1Width,
                    this.bauteile.kistenaufzug.width
                );
                let side2maxWidth = Math.max(side2Width, kistenaufzug2width);

                fullWidth =
                    this.bauteile.picksystem.width +
                    side1maxWidth +
                    side2maxWidth;
            }

            if (this.einlagerungsmodul.side == "long") {
                side1Length =
                    this.shelfSide1.rows * this.bauteile.lagerregal.width;

                side2Length =
                    this.shelfSide2.rows * this.bauteile.lagerregal.width +
                    this.einlagerungsmodulSize.width;

                if (this.shelfSide1.shelf != null) {
                    side1Width = this.shelfSide1.shelf.fullSize;
                }

                if (this.shelfSide2.shelf != null) {
                    side2Width = this.shelfSide2.shelf.fullSize;
                }

                let regalbediengerätWidth =
                    this.bauteile.regalbediengerät.diameter +
                    this.bauteile.regalbediengerät.margin.y1 +
                    this.bauteile.regalbediengerät.margin.y2;

                fullWidth =
                    side1Width +
                    regalbediengerätWidth +
                    this.einlagerungsmodulSize.depth;
            }

            return {
                width: fullWidth,
                length: Math.max(side1Length, side2Length),
            };
        },
    },
    created() {},
};
</script>

<style scoped></style>
