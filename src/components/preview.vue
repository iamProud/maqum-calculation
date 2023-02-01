<template>
    <Tile id="preview-tile" title="Vorschau">
        <canvas class="d-block m-auto" ref="preview-canvas"></canvas>

        <Shelf-Calculation
            :shelfSide1="shelfSide1"
            :shelfSide2="shelfSide2"
            :heightExtension="heightExtension"
            class="mt-4"
            @fixShelfsCalculation="$emit('fix-shelfs-calculation', $event)"
            @movable-shelfs-calculation="$emit('movable-shelfs-calculation', $event)"
        ></Shelf-Calculation>
    </Tile>
</template>

<script>
import Tile from "./tile.vue";
import ShelfCalculation from "./shelfCalculation.vue";

export default {
    components: {
        Tile: Tile,
        "Shelf-Calculation": ShelfCalculation,
    },

    props: [
        "length",
        "width",
        "heightExtension",
        "bauteile",
        "mashineDimensions",
        "shelfSide1",
        "shelfSide2",
        "einlagerungsmodul",
    ],

    data() {
        return {
            scaleValue: 1,
            ctx: null,

            roomRect: {
                width: 0,
                height: 0,
                lineWidth: 6,
            },

            mashineRect: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                lineWidth: 4,
            },

            kistenaufzug1Rect: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                lineWidth: 2,
            },

            kistenaufzug2Rect: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                lineWidth: 2,
            },

            picksystemRect: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                lineWidth: 2,
            },
        };
    },

    watch: {
        einlagerungsmodul: {
            handler(newValue, oldValue) {
                this.draw();
            },
            deep: true,
        },
    },

    methods: {
        draw() {
            // clear Previous Drawing
            this.clearDrawing();

            // set scale
            this.setScale();

            // draw Room
            this.drawRoom();

            // draw Mashine Dimensions
            this.drawMashine();

            // draw Einlagerungsmodul
            this.drawKistenaufzug1();

            this.drawPicksystem();

            if (this.einlagerungsmodul.type == "n20") {
                this.drawKistenaufzug2();
            }

            // draw Shelf Side 1
            if (this.shelfSide1.shelf != null) {
                this.drawShelfSide1();
                this.drawRBG();
            }

            // draw Shelf Side 2
            if (this.shelfSide2.shelf != null) {
                this.drawShelfSide2();
            }
        },

        clearDrawing() {
            let prevWidth = this.ctx.canvas.width;
            let prevHeight = this.ctx.canvas.height;
            this.ctx.clearRect(0, 0, prevWidth, prevHeight);
        },

        setScale() {
            let styles = getComputedStyle(document.querySelector("#preview-tile"));

            let w = parseInt(styles.getPropertyValue("width"), 10) - 150;
            let h = w * 0.8;

            this.scaleValue = Math.min(w / this.length, h / this.width);
        },

        scale(value) {
            return value * this.scaleValue;
        },

        drawRoom() {
            // set new Width/Height
            this.ctx.canvas.width = this.scale(this.length) + this.roomRect.lineWidth;
            this.ctx.canvas.height = this.scale(this.width) + this.roomRect.lineWidth;

            // draw Room Dimensions
            this.roomRect.width = this.scale(this.length);
            this.roomRect.height = this.scale(this.width);
            this.drawRect(
                this.roomRect.lineWidth,
                "black",
                0,
                0,
                this.roomRect.width,
                this.roomRect.height
            );
        },

        drawMashine() {
            this.mashineRect.x =
                (this.roomRect.lineWidth + this.mashineRect.lineWidth) / 2;
            this.mashineRect.y =
                (this.roomRect.lineWidth + this.mashineRect.lineWidth) / 2;
            this.mashineRect.width = this.scale(this.mashineDimensions.length);
            this.mashineRect.height = this.scale(this.mashineDimensions.width);

            this.drawRect(
                this.mashineRect.lineWidth,
                "red",
                this.mashineRect.x,
                this.mashineRect.y,
                this.mashineRect.width,
                this.mashineRect.height
            );

            console.log(this.mashineRect);
        },

        drawPicksystem() {
            let padding =
                (this.mashineRect.lineWidth + this.picksystemRect.lineWidth) / 2;

            if (this.einlagerungsmodul.side == "short") {
                this.picksystemRect.width =
                    this.scale(this.bauteile.picksystem.depth) -
                    this.picksystemRect.lineWidth;
                this.picksystemRect.height =
                    this.scale(this.bauteile.picksystem.width) -
                    this.picksystemRect.lineWidth;
                this.picksystemRect.y =
                    this.mashineRect.y +
                    this.scale(this.bauteile.kistenaufzug.width) +
                    padding;

                if (this.einlagerungsmodul.position == "left") {
                    this.picksystemRect.x = this.mashineRect.x + padding;
                }

                if (this.einlagerungsmodul.position == "right") {
                    this.picksystemRect.x =
                        this.mashineRect.x +
                        this.mashineRect.width -
                        this.picksystemRect.width -
                        padding;
                }
            }

            if (this.einlagerungsmodul.side == "long") {
                this.picksystemRect.width =
                    this.scale(this.bauteile.picksystem.width) -
                    this.picksystemRect.lineWidth;
                this.picksystemRect.height =
                    this.scale(this.bauteile.picksystem.depth) -
                    this.picksystemRect.lineWidth;

                this.picksystemRect.y =
                    this.mashineRect.y +
                    this.mashineRect.height -
                    this.picksystemRect.height -
                    padding;

                if (this.einlagerungsmodul.position == "left") {
                    this.picksystemRect.x =
                        this.mashineRect.x +
                        this.scale(this.bauteile.kistenaufzug.width) +
                        padding;
                }

                if (this.einlagerungsmodul.position == "right") {
                    this.picksystemRect.x =
                        this.mashineRect.x +
                        this.mashineRect.width -
                        this.scale(this.bauteile.kistenaufzug.width) -
                        this.picksystemRect.width -
                        padding;
                }
            }

            this.drawRect(
                this.picksystemRect.lineWidth,
                "purple",
                this.picksystemRect.x,
                this.picksystemRect.y,
                this.picksystemRect.width,
                this.picksystemRect.height
            );
        },

        drawKistenaufzug1() {
            let padding =
                (this.mashineRect.lineWidth + this.kistenaufzug1Rect.lineWidth) / 2;

            [
                this.kistenaufzug1Rect.width,
                this.kistenaufzug1Rect.height,
            ] = this.getKistenaufzugDimensions();

            if (this.einlagerungsmodul.side == "short") {
                this.kistenaufzug1Rect.y = this.mashineRect.y + padding;

                if (this.einlagerungsmodul.position == "left") {
                    this.kistenaufzug1Rect.x = this.mashineRect.x + padding;
                }

                if (this.einlagerungsmodul.position == "right") {
                    this.kistenaufzug1Rect.x =
                        this.mashineRect.x +
                        this.mashineRect.width -
                        this.kistenaufzug1Rect.width -
                        padding;
                }
            }

            if (this.einlagerungsmodul.side == "long") {
                this.kistenaufzug1Rect.y =
                    this.mashineRect.y +
                    this.mashineRect.height -
                    this.kistenaufzug1Rect.height -
                    padding;

                if (this.einlagerungsmodul.position == "left") {
                    this.kistenaufzug1Rect.x = this.mashineRect.x + padding;
                }

                if (this.einlagerungsmodul.position == "right") {
                    this.kistenaufzug1Rect.x =
                        this.mashineRect.x +
                        this.mashineRect.width -
                        this.kistenaufzug1Rect.width -
                        padding;
                }
            }

            this.drawRect(
                this.kistenaufzug1Rect.lineWidth,
                "blue",
                this.kistenaufzug1Rect.x,
                this.kistenaufzug1Rect.y,
                this.kistenaufzug1Rect.width,
                this.kistenaufzug1Rect.height
            );
        },

        drawKistenaufzug2() {
            let padding1 =
                (this.mashineRect.lineWidth + this.kistenaufzug2Rect.lineWidth) / 2;

            let padding2 =
                (this.picksystemRect.lineWidth + this.kistenaufzug2Rect.lineWidth) / 2;

            [
                this.kistenaufzug2Rect.width,
                this.kistenaufzug2Rect.height,
            ] = this.getKistenaufzugDimensions();

            if (this.einlagerungsmodul.side == "short") {
                // TODO: this is not correct
                this.kistenaufzug2Rect.y =
                    this.picksystemRect.y + this.picksystemRect.height + padding2;

                if (this.einlagerungsmodul.position == "left") {
                    this.kistenaufzug2Rect.x = this.mashineRect.x + padding1;
                }

                if (this.einlagerungsmodul.position == "right") {
                    this.kistenaufzug2Rect.x =
                        this.mashineRect.x +
                        this.mashineRect.width -
                        this.kistenaufzug2Rect.width -
                        padding1;
                }
            }

            if (this.einlagerungsmodul.side == "long") {
                this.kistenaufzug2Rect.y =
                    this.mashineRect.y +
                    this.mashineRect.height -
                    this.kistenaufzug2Rect.height -
                    padding1;

                if (this.einlagerungsmodul.position == "left") {
                    // TODO: this is not correct
                    this.kistenaufzug2Rect.x =
                        this.picksystemRect.x + this.picksystemRect.width + padding2;
                }

                if (this.einlagerungsmodul.position == "right") {
                    this.kistenaufzug2Rect.x =
                        this.picksystemRect.x - this.kistenaufzug2Rect.width - padding2;
                }
            }

            this.drawRect(
                this.kistenaufzug2Rect.lineWidth,
                "blue",
                this.kistenaufzug2Rect.x,
                this.kistenaufzug2Rect.y,
                this.kistenaufzug2Rect.width,
                this.kistenaufzug2Rect.height
            );
        },

        getKistenaufzugDimensions() {
            let width = 0;
            let height = 0;

            if (this.einlagerungsmodul.side == "short") {
                width =
                    this.scale(this.bauteile.kistenaufzug.depth) -
                    this.kistenaufzug1Rect.lineWidth;
                height =
                    this.scale(this.bauteile.kistenaufzug.width) -
                    this.kistenaufzug1Rect.lineWidth;
            }

            if (this.einlagerungsmodul.side == "long") {
                width =
                    this.scale(this.bauteile.kistenaufzug.width) -
                    this.kistenaufzug1Rect.lineWidth;

                height =
                    this.scale(this.bauteile.kistenaufzug.depth) -
                    this.kistenaufzug1Rect.lineWidth;
            }

            return [width, height];
        },

        drawShelfSide1() {
            let width = this.scale(this.bauteile.lagerregal.width);

            // fix
            let fixDepth = this.shelfSide1.shelf.fix;
            let fixHeight = this.scale(fixDepth);
            let fixY = this.mashineRect.y;

            this.drawShelfs(fixY, width, fixHeight, this.shelfSide1.rows);

            // movable
            let movableDepth = this.shelfSide1.shelf.movable;

            if (movableDepth != null) {
                let moveY = this.mashineRect.y + fixHeight;
                let moveHeight = this.scale(movableDepth);

                this.drawShelfs(moveY, width, moveHeight, this.shelfSide1.rows - 1);
            }
        },

        drawShelfSide2() {
            let width = this.scale(this.bauteile.lagerregal.width);
            let movableDepth = this.shelfSide2.shelf.movable;

            // fix
            var fixY = 0;
            let fixDepth = this.shelfSide2.shelf.fix;
            let fixHeight = this.scale(fixDepth);

            if (this.einlagerungsmodul.side == "short") {
                fixY = this.mashineRect.height - fixHeight;
            }

            if (this.einlagerungsmodul.side == "long") {
                if (movableDepth == null) {
                    fixY = this.picksystemRect.y;
                } else {
                    fixY = this.picksystemRect.y + this.scale(movableDepth);
                }
            }

            this.drawShelfs(fixY, width, fixHeight, this.shelfSide2.rows);

            // movable
            if (movableDepth != null) {
                let moveY = fixY - this.scale(movableDepth);
                let width = this.scale(this.bauteile.lagerregal.width);
                let moveHeight = this.scale(movableDepth);

                this.drawShelfs(moveY, width, moveHeight, this.shelfSide2.rows - 1);
            }
        },

        drawShelfs(y, width, height, number) {
            let x0 = 0;
            let dir = 0;

            if (this.einlagerungsmodul.position == "left") {
                x0 =
                    this.mashineRect.x +
                    this.mashineRect.width -
                    this.scale(this.bauteile.lagerregal.width);
                dir = -1;
            }

            if (this.einlagerungsmodul.position == "right") {
                x0 = this.mashineRect.x;
                dir = 1;
            }

            for (let i = 0; i < number; i++) {
                let x = x0 + dir * i * this.scale(this.bauteile.lagerregal.width);

                this.drawRect(2, "gray", x, y, width, height);
            }
        },

        drawRBG() {
            let lineWidth = 2;
            let r = this.scale(this.bauteile.regalbediengerät.diameter / 2);
            let x = 0;
            let y =
                this.scale(this.shelfSide1.shelf.fullSize) +
                r +
                lineWidth / 2 +
                this.scale(this.bauteile.regalbediengerät.margin.y1);

            if (this.einlagerungsmodul.position == "left") {
                x =
                    this.mashineRect.x +
                    this.mashineRect.width -
                    r -
                    this.scale(this.bauteile.regalbediengerät.margin.x2);
            }

            if (this.einlagerungsmodul.position == "right") {
                x =
                    this.mashineRect.x +
                    r +
                    this.scale(this.bauteile.regalbediengerät.margin.x1);
            }

            this.ctx.arc(x, y, r, 0, 2 * Math.PI);
            this.ctx.lineWidth = lineWidth;
            this.ctx.strokeStyle = "lime";
            this.ctx.stroke();
        },

        drawRect(lineWidth, color, x, y, width, height) {
            this.ctx.lineWidth = lineWidth;
            this.ctx.strokeStyle = color;
            this.ctx.strokeRect(x + lineWidth / 2, y + lineWidth / 2, width, height);
        },
    },

    mounted() {
        this.ctx = this.$refs["preview-canvas"].getContext("2d");

        this.$watch("length", (newL, prevL) => {
            this.draw();
        });

        this.$watch("width", (newL, prevL) => {
            this.draw();
        });

        this.$watch("mashineDimensions", () => {
            this.draw();
        });
    },
};
</script>

<style scoped></style>
