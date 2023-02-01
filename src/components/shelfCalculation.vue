<template>
    <div>
        <table class="table">
            <thead>
                <tr>
                    <th scope="col"></th>
                    <th scope="col">25er</th>
                    <th scope="col">35er</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row">Fest</th>
                    <td>{{ getFixShelfs()["25"] }}</td>
                    <td>{{ getFixShelfs()["35"] }}</td>
                </tr>
                <tr>
                    <th scope="row">Beweglich</th>
                    <td>{{ getMovableShelfs()["25"] }}</td>
                    <td>{{ getMovableShelfs()["35"] }}</td>
                </tr>
            </tbody>
        </table>

        <div>
            <p>Anzahl Artikel ca.: {{ getArticleEstimation() }}</p>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        shelfSide1: { type: Object, default: { rows: 0, shelf: null } },
        shelfSide2: { type: Object, default: { rows: 0, shelf: null } },
        heightExtension: { type: Number, default: 0 },
    },

    methods: {
        getFixShelfs() {
            let side1Fix25 = 0;
            let side1Fix35 = 0;
            let side2Fix25 = 0;
            let side2Fix35 = 0;

            let side1Rows = Number(this.shelfSide1.rows);
            let side2Rows = Number(this.shelfSide2.rows);

            if (this.shelfSide1.shelf != null) {
                side1Fix25 = this.shelfSide1.shelf.fix == 250 ? side1Rows : 0;
                side1Fix35 = this.shelfSide1.shelf.fix == 350 ? side1Rows : 0;
            }

            if (this.shelfSide2.shelf != null) {
                side2Fix25 = this.shelfSide2.shelf.fix == 250 ? side2Rows : 0;
                side2Fix35 = this.shelfSide2.shelf.fix == 350 ? side2Rows : 0;
            }

            let fixShelfs = {
                25: side1Fix25 + side2Fix25,
                35: side1Fix35 + side2Fix35,
            };

            this.$emit("fix-shelfs-calculation", fixShelfs);

            return fixShelfs;
        },

        getMovableShelfs() {
            let side1Movable25 = 0;
            let side1Movable35 = 0;
            let side2Movable25 = 0;
            let side2Movable35 = 0;

            let side1Rows = Number(this.shelfSide1.rows);
            let side2Rows = Number(this.shelfSide2.rows);

            if (this.shelfSide1.shelf != null) {
                side1Movable25 = this.shelfSide1.shelf.movable == 250 ? side1Rows - 1 : 0;

                side1Movable35 = this.shelfSide1.shelf.movable == 350 ? side1Rows - 1 : 0;
            }

            if (this.shelfSide2.shelf != null) {
                side2Movable25 = this.shelfSide2.shelf.movable == 250 ? side2Rows - 1 : 0;

                side2Movable35 = this.shelfSide2.shelf.movable == 350 ? side2Rows - 1 : 0;
            }

            let movableShelfs = {
                25: side1Movable25 + side2Movable25,
                35: side1Movable35 + side2Movable35,
            };

            this.$emit("movable-shelfs-calculation", movableShelfs);

            return movableShelfs;
        },

        getShelfType(shelfSide) {
            if (shelfSide.shelf == null) {
                return "keine";
            }

            return shelfSide.shelf.type;
        },

        getArticleEstimation() {
            let fixShelfs = this.getFixShelfs();
            let movableShelfs = this.getMovableShelfs();

            let areaFix35 =
                fixShelfs["35"] * 2 + (fixShelfs["35"] * this.heightExtension) / 4;
            let areaMovable35 =
                movableShelfs["35"] * 2 +
                (movableShelfs["35"] * this.heightExtension) / 4;
            let areaFix25 =
                fixShelfs["25"] * 2 + (fixShelfs["25"] * this.heightExtension) / 4;
            let areaMovable25 =
                movableShelfs["25"] * 2 +
                (movableShelfs["25"] * this.heightExtension) / 4;

            let area35 = areaFix35 + areaMovable35;
            let area25 = areaFix25 + areaMovable25;

            return Math.round(area25 * 463 + area35 * 668);
        },
    },
};
</script>

<style scoped></style>
