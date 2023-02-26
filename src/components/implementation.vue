<template>
    <Tile title="Ausführung" class="col-6">
        <div>
            <div class="row">
                <!-- Einlagerungsmodul Position -->
                <label class="col-5" for="einlagerungsmodul-position"
                    >Einlagerungsmodul Position</label
                >

                <select
                    name="einlagerungsmodul-side"
                    id="einlagerungsmodul-side"
                    v-model="einlagerungsmodul.side"
                    @change="
                        $emit(
                            'einlagerungsmodul-side-change',
                            einlagerungsmodul.side
                        )
                    "
                    class="col-auto"
                >
                    <option value="short">Kurze Seite</option>
                    <option value="long">Lange Seite</option>
                </select>

                <select
                    name="einlagerungsmodul-position"
                    id="einlagerungsmodul-position"
                    v-model="einlagerungsmodul.position"
                    @change="
                        $emit(
                            'einlagerungsmodul-position-change',
                            einlagerungsmodul.position
                        )
                    "
                    class="col-auto"
                >
                    <option value="left">Links</option>
                    <option value="right">Rechts</option>
                </select>
            </div>

            <!-- Einlagerungsmodul Kistenzahl -->
            <div class="row">
                <span class="col-5">Anzahl Lieferkisten</span>
                <!-- <span class="col-1">
					<input
						type="radio"
						name="num-delivery-box"
						id="num-delivery-box-5"
						value="5"
					/>
					<label for="num-delivery-box-5">5</label>
				</span> -->

                <span class="col-auto">
                    <input
                        type="radio"
                        name="num-delivery-box"
                        id="num-delivery-box-10"
                        value="n10"
                        v-model="einlagerungsmodul.type"
                        @change="
                            $emit(
                                'einlagerungsmodul-typ-change',
                                einlagerungsmodul.type
                            )
                        "
                    />
                    <label for="num-delivery-box-10">10</label>
                </span>

                <span class="col-auto">
                    <input
                        type="radio"
                        name="num-delivery-box"
                        id="num-delivery-box-20"
                        value="n20"
                        v-model="einlagerungsmodul.type"
                        @change="
                            $emit(
                                'einlagerungsmodul-typ-change',
                                einlagerungsmodul.type
                            )
                        "
                    />
                    <label for="num-delivery-box-20">20</label>
                </span>
            </div>

            <div class="row">
                <span class="col-5">Höhenerweiterung (25cm)</span>

                <input
                    class="col-auto"
                    type="number"
                    name="height-extension"
                    id="height-extension"
                    min="0"
                    :max="maxExtension"
                    v-model="heightExtension"
                    @change="heightExtensionChange"
                />

                <span class="col-auto">(max {{ maxExtension }})</span>
            </div>
        </div>
    </Tile>
</template>

<script>
export default {
    props: {
        einlagerungsmodul: {
            type: Object,
            default: { type: "n10", position: "short", side: "left" },
        },
        height: Number,
        shelfSide1: { type: Object, default: { rows: 0, shelf: null } },
        shelfSide2: { type: Object, default: { rows: 0, shelf: null } },
    },

    watch: {
        height(newHeight) {
            let newExtension = this.getMaxExtension(newHeight);

            if (this.heightExtension > newExtension) {
                this.heightExtension = newExtension;
            }
        },
    },

    data() {
        return {
            heightExtension: 0,
        };
    },

    methods: {
        heightExtensionChange() {
            this.$emit("height-extension-change", this.heightExtension);
        },

        getMaxExtension(height) {
            if (height < 2000) {
                return 0;
            }

            return Math.floor((height - 2000) / 250);
        },
    },

    computed: {
        maxExtension() {
            if (this.height < 2000) {
                return 0;
            }

            return Math.floor((this.height - 2000) / 250);
        },
    },
};
</script>

<style scoped></style>
