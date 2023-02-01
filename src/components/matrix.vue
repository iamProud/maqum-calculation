<template>
    <Tile>
        <div id="chart">
            <div v-if="side1.possibleVersions.length != 0">
                <h5 class="text-center">Regalreihe 1</h5>
                <apexchart
                    id="side-1"
                    type="heatmap"
                    width="98%"
                    height="250"
                    :options="chartOptions"
                    :series="side1.possibleVersions"
                    @dataPointSelection="dataPointClicked"
                ></apexchart>
            </div>

            <div v-if="side2.possibleVersions.length != 0">
                <hr />
                <h5 class="text-center">Regalreihe 2</h5>
                <apexchart
                    id="side-2"
                    type="heatmap"
                    width="98%"
                    height="250"
                    :options="chartOptions"
                    :series="side2.possibleVersions"
                    @dataPointSelection="dataPointClicked"
                ></apexchart>
            </div>
        </div>
    </Tile>
</template>

<script>
import Tile from "./tile.vue";

export default {
    components: {
        Tile: Tile,
    },

    props: ["dimension", "bauteile", "einlagerungsmodul", "einlagerungsmodulSize"],

    data() {
        return {
            versions: [
                {
                    type: "25",
                    fullSize: 250,
                    fix: 250,
                    movable: null,
                },
                {
                    type: "35",
                    fullSize: 350,
                    fix: 350,
                    movable: null,
                },
                {
                    type: "25+25",
                    fullSize: 500,
                    fix: 250,
                    movable: 250,
                },
                {
                    type: "25+35",
                    fullSize: 600,
                    fix: 350,
                    movable: 250,
                },
                {
                    type: "35+35",
                    fullSize: 700,
                    fix: 350,
                    movable: 350,
                },
            ],

            side1: {
                restWidth: 0,
                restLength: 0,
                possibleVersions: [],
                selectedVersion: null,
            },
            side2: {
                restWidth: 0,
                restLength: 0,
                possibleVersions: [],
                selectedVersion: null,
            },

            chartOptions: {
                chart: {
                    fontFamily: "sans-serif",
                    toolbar: {
                        show: false,
                    },
                    offsetX: 10,
                },
                tooltip: {
                    enabled: false,
                },
                dataLabels: {
                    enabled: false,
                },

                xaxis: {
                    title: {
                        text: "Anzahl Regalelemente",
                        style: {
                            fontSize: "14px",
                            fontWeight: 600,
                        },
                    },
                },

                yaxis: {
                    title: {
                        text: "Regaltiefe",
                        offsetY: 5,
                        style: {
                            fontSize: "14px",
                            fontWeight: 600,
                        },
                    },
                },

                plotOptions: {
                    heatmap: {
                        colorScale: {
                            ranges: [
                                {
                                    from: 0,
                                    to: 5,
                                    color: "#00FF00",
                                    name: "möglich",
                                },
                                {
                                    from: -10,
                                    to: -1,
                                    color: "#FF0000",
                                    name: "nicht möglich",
                                },
                            ],
                        },
                    },
                },
            },
        };
    },

    watch: {
        dimension: {
            handler() {
                this.reEvaluate();
            },

            deep: true,
        },

        einlagerungsmodul: {
            handler() {
                this.reEvaluate();
            },

            deep: true,
        },

        einlagerungsmodulSize() {
            this.reEvaluate();
        },
    },

    methods: {
        reEvaluate() {
            this.calcPossibleVersionsSide1();
            if (this.side1.selectedVersion == null) {
                return;
            }

            // check if selected version is still possible
            let side1IsValid = this.selectionIsValid(this.side1);
            if (!side1IsValid) {
                this.resetSide1();
                this.resetSide2();
                return;
            }

            this.calcPossibleVersionsSide2();

            if (this.side2.selectedVersion == null) {
                return;
            }

            let side2IsValid = this.selectionIsValid(this.side2);
            if (!side2IsValid) {
                this.resetSide2();
            }
        },

        selectionIsValid(side) {
            let selectedType = side.selectedVersion.shelf.type;
            let selectedVersion = side.possibleVersions.find(
                (version) => version.name == selectedType
            );

            let isIncluded = selectedVersion.data.some(
                (val) => val.x == side.selectedVersion.rows && val.y == 1
            );

            return isIncluded;
        },

        calcPossibleVersionsSide1() {
            var tmpRestWidth = 0;
            var tmpRestLength = 0;

            // TODO: Fix restWidth calculation
            if (this.einlagerungsmodul.side == "short") {
                tmpRestWidth =
                    this.dimension.width -
                    Math.max(
                        this.bauteile.regalbediengerät.diameter,
                        this.einlagerungsmodulSize.width
                    );

                tmpRestLength = this.dimension.length - this.einlagerungsmodulSize.depth;
            }

            if (this.einlagerungsmodul.side == "long") {
                tmpRestWidth =
                    this.dimension.width -
                    this.bauteile.regalbediengerät.diameter -
                    this.einlagerungsmodulSize.depth;

                tmpRestLength = this.dimension.length;
            }

            this.side1.restWidth = Math.max(0, tmpRestWidth);
            this.side1.restLength = Math.max(0, tmpRestLength);

            // calc max number of Rows
            let nRows = 0;

            if (this.side1.restLength > 0) {
                nRows = Math.ceil(this.side1.restLength / this.bauteile.lagerregal.width);
            }

            // loop through all combinations
            this.side1.possibleVersions = this.getPossibleVersions(
                nRows,
                this.side1.restLength,
                this.side1.restWidth
            );
        },

        calcPossibleVersionsSide2() {
            var tmpRestWidth = 0;
            var tmpRestLength = 0;

            if (this.einlagerungsmodul.side == "short") {
                tmpRestWidth =
                    this.side1.restWidth - this.side1.selectedVersion.shelf.fullSize;

                tmpRestLength = this.dimension.length - this.einlagerungsmodulSize.depth;
            }

            if (this.einlagerungsmodul.side == "long") {
                let overlap =
                    this.side1.selectedVersion.shelf.fullSize -
                    this.einlagerungsmodulSize.depth;

                tmpRestWidth = this.side1.restWidth - Math.max(0, overlap);

                tmpRestLength = this.dimension.length - this.einlagerungsmodulSize.width;
            }

            this.side2.restWidth = Math.max(0, tmpRestWidth);
            this.side2.restLength = Math.max(0, tmpRestLength);

            // calc max number of Rows
            let nRows = 0;

            if (this.side2.restLength > 0) {
                nRows = Math.ceil(this.side2.restLength / this.bauteile.lagerregal.width);
            }

            // loop through all combinations
            this.side2.possibleVersions = this.getPossibleVersions(
                nRows,
                this.side2.restLength,
                this.side2.restWidth
            );
        },

        getPossibleVersions(nRows, restLength, restWidth) {
            var possibleVersions = [];

            for (let el of this.versions) {
                let newRow = { name: el.type, data: [] };

                for (let row = 1; row <= nRows; row++) {
                    let fitWidth = restWidth > el.fullSize;
                    let fitLength = restLength - row * this.bauteile.lagerregal.width > 0;
                    let val =
                        fitWidth && fitLength && (row > 1 || el.movable == null) ? 1 : -1;

                    newRow.data.push({ x: row.toString(), y: val });
                }
                possibleVersions.push(newRow);
            }

            return possibleVersions;
        },

        dataPointClicked(event, chartContext, config) {
            let dataPoint = this.side1.possibleVersions[config.seriesIndex].data[
                config.dataPointIndex
            ];

            if (dataPoint.y != 1) {
                return; // no possible version
            }

            let nRows = dataPoint.x;
            let shelfType = this.versions[config.seriesIndex];

            if (chartContext.el.id == "side-1") {
                this.side1.selectedVersion = {
                    rows: nRows,
                    shelf: shelfType,
                };

                this.$emit("select-side-1", this.side1.selectedVersion);

                this.calcPossibleVersionsSide2();
            }

            if (chartContext.el.id == "side-2") {
                this.side2.selectedVersion = {
                    rows: nRows,
                    shelf: shelfType,
                };

                this.$emit("select-side-2", this.side2.selectedVersion);

                this.calcPossibleVersionsSide1();
            }
        },

        resetSide1() {
            this.side1.selectedVersion = null;
            this.side2.possibleVersions = [];
            this.$emit("select-side-1", { rows: 0, shelf: null });
        },

        resetSide2() {
            this.side2.selectedVersion = null;
            this.$emit("select-side-2", { rows: 0, shelf: null });
        },
    },
};
</script>

<style scoped></style>
