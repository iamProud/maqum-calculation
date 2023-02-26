<template>
    <Tile id="preview-tile" title="Vorschau">
        <canvas class="d-block m-auto" ref="preview-canvas"></canvas>

        <Shelf-Calculation
            :shelfSide1="shelfSide1"
            :shelfSide2="shelfSide2"
            :heightExtension="heightExtension"
            class="mt-4"
            @fixShelfsCalculation="$emit('fix-shelfs-calculation', $event)"
            @movable-shelfs-calculation="
                $emit('movable-shelfs-calculation', $event)
            "
        ></Shelf-Calculation>
    </Tile>
</template>

<script>
import ShelfCalculation from "./shelfCalculation.vue";

export default {
    components: {
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
                lineWidth: 1,
                color: "black",
            },

            mashineRect: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                color: "#BCBCBC",
            },

            kistenaufzugRect: {
                1: {
                    x: 0,
                    y: 0,
                },
                2: {
                    x: 0,
                    y: 0,
                },
                width: 0,
                height: 0,
                color: "#5872B9",
            },

            picksystemRect: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                color: "#354C87",
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

            // draw Picksystem
            this.drawPicksystem();

            // draw Einlagerungsmodul
            [this.kistenaufzugRect.width, this.kistenaufzugRect.height] =
                this.getKistenaufzugDimensions();

            this.drawKistenaufzug1();

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
            let styles = getComputedStyle(
                document.querySelector("#preview-tile")
            );

            let w = parseInt(styles.getPropertyValue("width"), 10) - 150;
            let h = w * 0.8;

            this.scaleValue = Math.min(w / this.length, h / this.width);
        },

        scale(value) {
            return value * this.scaleValue;
        },

        drawRoom() {
            // set new Width/Height
            this.ctx.canvas.width =
                this.scale(this.length) + 2 * this.roomRect.lineWidth;
            this.ctx.canvas.height =
                this.scale(this.width) + 2 * this.roomRect.lineWidth;

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
            this.mashineRect.y = this.roomRect.lineWidth;
            this.mashineRect.width = this.scale(this.mashineDimensions.length);
            this.mashineRect.height = this.scale(this.mashineDimensions.width);

            if (
                (this.einlagerungsmodul.position == "left" &&
                    this.einlagerungsmodul.side == "short") ||
                (this.einlagerungsmodul.position == "right" &&
                    this.einlagerungsmodul.side == "long")
            ) {
                this.mashineRect.x =
                    this.roomRect.width - this.mashineRect.width;
            }

            if (
                (this.einlagerungsmodul.position == "right" &&
                    this.einlagerungsmodul.side == "short") ||
                (this.einlagerungsmodul.position == "left" &&
                    this.einlagerungsmodul.side == "long")
            ) {
                this.mashineRect.x = this.roomRect.lineWidth;
            }

            this.fillRect(
                this.mashineRect.color,
                this.mashineRect.x,
                this.mashineRect.y,
                this.mashineRect.width,
                this.mashineRect.height
            );
        },

        drawPicksystem() {
            if (this.einlagerungsmodul.side == "short") {
                this.picksystemRect.width = this.scale(
                    this.bauteile.picksystem.depth
                );

                this.picksystemRect.height = this.scale(
                    this.bauteile.picksystem.width
                );

                let shelfSide1Width =
                    this.shelfSide1.shelf != null
                        ? this.shelfSide1.shelf.fullSize
                        : 0;

                this.picksystemRect.y = this.scale(
                    Math.max(this.bauteile.kistenaufzug.width, shelfSide1Width)
                );

                if (this.einlagerungsmodul.position == "left") {
                    this.picksystemRect.x = this.mashineRect.x;
                }

                if (this.einlagerungsmodul.position == "right") {
                    this.picksystemRect.x =
                        this.mashineRect.x +
                        this.mashineRect.width -
                        this.picksystemRect.width;
                }
            }

            if (this.einlagerungsmodul.side == "long") {
                this.picksystemRect.width = this.scale(
                    this.bauteile.picksystem.width
                );
                this.picksystemRect.height = this.scale(
                    this.bauteile.picksystem.depth
                );

                this.picksystemRect.y =
                    this.mashineRect.y +
                    this.mashineRect.height -
                    this.picksystemRect.height;

                if (this.einlagerungsmodul.position == "left") {
                    this.picksystemRect.x =
                        this.mashineRect.x +
                        this.scale(this.bauteile.kistenaufzug.width);
                }

                if (this.einlagerungsmodul.position == "right") {
                    this.picksystemRect.x =
                        this.mashineRect.x +
                        this.mashineRect.width -
                        this.scale(this.bauteile.kistenaufzug.width) -
                        this.picksystemRect.width;
                }
            }

            this.fillRect(
                this.picksystemRect.color,
                this.picksystemRect.x,
                this.picksystemRect.y,
                this.picksystemRect.width,
                this.picksystemRect.height
            );
        },

        drawKistenaufzug1() {
            if (this.einlagerungsmodul.side == "short") {
                this.kistenaufzugRect["1"].y =
                    this.picksystemRect.y -
                    this.scale(this.bauteile.kistenaufzug.width);

                if (this.einlagerungsmodul.position == "left") {
                    this.kistenaufzugRect["1"].x = this.mashineRect.x;
                }

                if (this.einlagerungsmodul.position == "right") {
                    this.kistenaufzugRect["1"].x =
                        this.mashineRect.x +
                        this.mashineRect.width -
                        this.kistenaufzugRect.width;
                }
            }

            if (this.einlagerungsmodul.side == "long") {
                this.kistenaufzugRect["1"].y =
                    this.mashineRect.y +
                    this.mashineRect.height -
                    this.kistenaufzugRect.height;

                if (this.einlagerungsmodul.position == "left") {
                    this.kistenaufzugRect["1"].x = this.mashineRect.x;
                }

                if (this.einlagerungsmodul.position == "right") {
                    this.kistenaufzugRect["1"].x =
                        this.mashineRect.x +
                        this.mashineRect.width -
                        this.kistenaufzugRect.width;
                }
            }

            // Extended Kistenaufzug
            this.drawKistenaufzugExtension(this.kistenaufzugRect, "1");

            // Kistenaufzug
            this.fillRect(
                this.kistenaufzugRect.color,
                this.kistenaufzugRect["1"].x,
                this.kistenaufzugRect["1"].y,
                this.kistenaufzugRect.width,
                this.kistenaufzugRect.height
            );
        },

        drawKistenaufzug2() {
            [this.kistenaufzugRect.width, this.kistenaufzugRect.height] =
                this.getKistenaufzugDimensions();

            if (this.einlagerungsmodul.side == "short") {
                this.kistenaufzugRect["2"].y =
                    this.picksystemRect.y + this.picksystemRect.height;

                if (this.einlagerungsmodul.position == "left") {
                    this.kistenaufzugRect["2"].x = this.mashineRect.x;
                }

                if (this.einlagerungsmodul.position == "right") {
                    this.kistenaufzugRect["2"].x =
                        this.mashineRect.x +
                        this.mashineRect.width -
                        this.kistenaufzugRect.width;
                }
            }

            if (this.einlagerungsmodul.side == "long") {
                this.kistenaufzugRect["2"].y =
                    this.mashineRect.y +
                    this.mashineRect.height -
                    this.kistenaufzugRect.height;

                if (this.einlagerungsmodul.position == "left") {
                    this.kistenaufzugRect["2"].x =
                        this.picksystemRect.x + this.picksystemRect.width;
                }

                if (this.einlagerungsmodul.position == "right") {
                    this.kistenaufzugRect["2"].x =
                        this.picksystemRect.x - this.kistenaufzugRect.width;
                }
            }

            // Extended Kistenaufzug
            this.drawKistenaufzugExtension(this.kistenaufzugRect, "2");

            this.fillRect(
                "#5872B9",
                this.kistenaufzugRect["2"].x,
                this.kistenaufzugRect["2"].y,
                this.kistenaufzugRect.width,
                this.kistenaufzugRect.height
            );
        },

        getKistenaufzugDimensions() {
            let width = 0;
            let height = 0;

            if (this.einlagerungsmodul.side == "short") {
                width = this.scale(this.bauteile.kistenaufzug.depth);
                height = this.scale(this.bauteile.kistenaufzug.width);
            }

            if (this.einlagerungsmodul.side == "long") {
                width = this.scale(this.bauteile.kistenaufzug.width);
                height = this.scale(this.bauteile.kistenaufzug.depth);
            }

            return [width, height];
        },

        drawKistenaufzugExtension(kistenaufzugRect, id) {
            let extended = this.scale(this.bauteile.kistenaufzug.extended);
            let extendedX = 0;
            let extendedY = 0;

            if (
                this.einlagerungsmodul.side == "short" &&
                this.einlagerungsmodul.position == "right"
            ) {
                extendedX = kistenaufzugRect[id].x + extended;
                extendedY = kistenaufzugRect[id].y;
            }

            if (
                this.einlagerungsmodul.side == "short" &&
                this.einlagerungsmodul.position == "left"
            ) {
                extendedX = kistenaufzugRect[id].x - extended;
                extendedY = kistenaufzugRect[id].y;
            }

            if (this.einlagerungsmodul.side == "long") {
                extendedX = kistenaufzugRect[id].x;
                extendedY = kistenaufzugRect[id].y + extended;
            }

            this.drawRect(
                2,
                this.kistenaufzugRect.color,
                extendedX,
                extendedY,
                kistenaufzugRect.width - 2,
                kistenaufzugRect.height - 2,
                [5, 5]
            );
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

                this.drawShelfs(
                    moveY,
                    width,
                    moveHeight,
                    this.shelfSide1.rows - 1
                );
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

                this.drawShelfs(
                    moveY,
                    width,
                    moveHeight,
                    this.shelfSide2.rows - 1
                );
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
                let x =
                    x0 + dir * i * this.scale(this.bauteile.lagerregal.width);

                this.fillRect("#52545B", x + 1, y + 1, width - 2, height - 2);
            }
        },

        drawRBG() {
            let r = this.scale(this.bauteile.regalbediengerät.diameter / 2);
            let x = 0;

            // get center of this.picksystemRect
            let picksystemCenter = {
                x: this.picksystemRect.x + this.picksystemRect.width / 2,
                y: this.picksystemRect.y + this.picksystemRect.height / 2,
            };

            let y =
                this.scale(this.shelfSide1.shelf.fullSize) +
                r +
                this.scale(this.bauteile.regalbediengerät.margin.y1);

            if (this.einlagerungsmodul.side == "short") {
                y = picksystemCenter.y;
            }

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

            this.ctx.beginPath();

            this.ctx.arc(x, y, r, 0, 2 * Math.PI);
            this.ctx.fillStyle = "#4ABCC8";
            this.ctx.fill();
        },

        drawRect(lineWidth, color, x, y, width, height, lineDash = []) {
            this.ctx.lineWidth = lineWidth;
            this.ctx.strokeStyle = color;
            this.ctx.setLineDash(lineDash);
            this.ctx.strokeRect(
                x + lineWidth / 2,
                y + lineWidth / 2,
                width,
                height
            );
        },

        fillRect(color, x, y, width, height) {
            this.ctx.beginPath();
            this.ctx.rect(x, y, width, height);
            this.ctx.fillStyle = color;
            this.ctx.fill();
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
