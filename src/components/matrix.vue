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
export default {
    props: [
        "dimension",
        "bauteile",
        "einlagerungsmodul",
        "einlagerungsmodulSize",
        "shelfSide1",
        "shelfSide2",
    ],

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
                                    to: 0,
                                    color: "#FF0000",
                                    name: "nicht möglich",
                                },
                                {
                                    from: 1,
                                    to: 1,
                                    color: "#00FF00",
                                    name: "möglich",
                                },

                                {
                                    from: 2,
                                    to: 2,
                                    color: "#FFFF00",
                                    name: "ausgewählt",
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

                // side 1
                this.colorSelection(this.side1);

                // side 2
                this.colorSelection(this.side2);
            },

            deep: true,
        },

        einlagerungsmodul: {
            handler() {
                this.reEvaluate();

                // side 1
                this.colorSelection(this.side1);

                // side 2
                this.colorSelection(this.side2);
            },

            deep: true,
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

            if (selectedVersion == undefined) {
                return false;
            }

            let isIncluded = selectedVersion.data.some(
                (val) => val.x == side.selectedVersion.rows && val.y == 1
            );
            return isIncluded;
        },

        calcPossibleVersionsSide1() {
            var tmpRestWidth = 0;
            var tmpRestLength = 0;

            if (this.einlagerungsmodul.side == "short") {
                tmpRestWidth =
                    this.dimension.width - this.einlagerungsmodulSize.width;

                tmpRestLength =
                    this.dimension.length -
                    this.einlagerungsmodulSize.depth -
                    this.bauteile.kistenaufzug.extended;
            }

            if (this.einlagerungsmodul.side == "long") {
                tmpRestWidth =
                    this.dimension.width -
                    this.bauteile.regalbediengerät.diameter -
                    this.einlagerungsmodulSize.depth -
                    this.bauteile.kistenaufzug.extended -
                    this.bauteile.regalbediengerät.margin.y1 -
                    this.bauteile.regalbediengerät.margin.y2;

                tmpRestLength = this.dimension.length;
            }

            this.side1.restWidth = Math.max(0, tmpRestWidth);
            this.side1.restLength = Math.max(0, tmpRestLength);

            // calc max number of Rows
            let nRows = 0;

            if (this.side1.restLength > 0) {
                nRows = Math.ceil(
                    this.side1.restLength / this.bauteile.lagerregal.width
                );
            }

            let isOverlapping = this.einlagerungsmodul.side == "short";

            // loop through all combinations
            this.side1.possibleVersions = this.getPossibleVersions(
                nRows,
                this.side1.restLength,
                this.side1.restWidth,
                isOverlapping
            );
        },

        calcPossibleVersionsSide2() {
            var tmpRestWidth = 0;
            var tmpRestLength = 0;

            if (this.einlagerungsmodul.side == "short") {
                var surplus = 0;

                if (this.side1.selectedVersion != null) {
                    surplus =
                        this.side1.selectedVersion.shelf.fullSize -
                        this.bauteile.kistenaufzug.width;
                }

                tmpRestWidth = this.side1.restWidth - Math.max(surplus, 0);

                tmpRestLength =
                    this.dimension.length -
                    this.einlagerungsmodulSize.depth -
                    this.bauteile.kistenaufzug.extended;
            }

            if (this.einlagerungsmodul.side == "long") {
                // overlaps with einlagerungsmodul which is already respected on side1
                let overlap =
                    this.side1.selectedVersion.shelf.fullSize -
                    this.einlagerungsmodulSize.depth;

                tmpRestWidth = this.side1.restWidth - Math.max(0, overlap);

                tmpRestLength =
                    this.dimension.length - this.einlagerungsmodulSize.width;
            }

            this.side2.restWidth = Math.max(0, tmpRestWidth);
            this.side2.restLength = Math.max(0, tmpRestLength);

            // calc max number of Rows
            let nRows = 0;

            if (this.side2.restLength > 0) {
                nRows = Math.ceil(
                    this.side2.restLength / this.bauteile.lagerregal.width
                );
            }

            let isOverlapping =
                this.einlagerungsmodul.type == "n20" &&
                this.einlagerungsmodul.side == "short";

            // loop through all combinations
            this.side2.possibleVersions = this.getPossibleVersions(
                nRows,
                this.side2.restLength,
                this.side2.restWidth,
                isOverlapping
            );
        },

        getPossibleVersions(nRows, restLength, restWidth, isOverlapping) {
            var possibleVersions = [];

            // check if there is enough space
            if (
                this.dimension.width < this.einlagerungsmodulSize.width ||
                this.dimension.length <
                    this.einlagerungsmodulSize.depth +
                        this.bauteile.kistenaufzug.extended
            ) {
                return possibleVersions;
            }

            // calculate overlapping width
            let overlapping = isOverlapping
                ? this.bauteile.kistenaufzug.width
                : 0;

            for (let el of this.versions) {
                let newRow = { name: el.type, data: [] };

                for (let row = 1; row <= nRows; row++) {
                    let fitWidth = restWidth > el.fullSize - overlapping;
                    let fitLength =
                        restLength - row * this.bauteile.lagerregal.width > 0;
                    let val =
                        fitWidth && fitLength && (row > 1 || el.movable == null)
                            ? 1
                            : 0;

                    newRow.data.push({ x: row.toString(), y: val });
                }
                possibleVersions.push(newRow);
            }

            return possibleVersions;
        },

        dataPointClicked(event, chartContext, config) {
            let side = null;
            switch (chartContext.el.id) {
                case "side-1":
                    side = this.side1;
                    break;
                case "side-2":
                    side = this.side2;
                    break;
                default:
                    console.error("Unknown chart id");
                    return;
            }

            let dataPoint =
                side.possibleVersions[config.seriesIndex].data[
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

                this.clearSelection(this.side1);
                this.colorSelection(this.side1);

                this.$emit("select-side-1", this.side1.selectedVersion);

                this.calcPossibleVersionsSide2();
            }

            if (chartContext.el.id == "side-2") {
                this.side2.selectedVersion = {
                    rows: nRows,
                    shelf: shelfType,
                };

                this.clearSelection(this.side2);
                this.colorSelection(this.side2);

                this.$emit("select-side-2", this.side2.selectedVersion);
            }
        },

        colorSelection(side) {
            if (side.possibleVersions == null || side.selectedVersion == null)
                return;

            let type = side.selectedVersion.shelf.type;
            let rows = side.selectedVersion.rows;

            side.possibleVersions
                .find((v) => v.name == type)
                .data.find((d) => d.x == rows).y = 2;
        },

        clearSelection(side) {
            if (side.possibleVersions == null) return;

            side.possibleVersions.forEach((v) => {
                v.data.forEach((d) => {
                    if (d.y == 2) {
                        d.y = 1;
                    }
                });
            });
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

<style></style>
