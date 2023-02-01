<template>
	<table class="table">
		<thead>
			<tr>
				<th scope="col">Element</th>
				<!-- <th scope="col">Soll VK</th> -->
				<th scope="col">Einzelpreis</th>
				<!-- <th scope="col">EK Serie</th>
				<th scope="col">EK</th> -->
				<th scope="col">Anzahl</th>
				<!-- <th scope="col">Summe EK</th> -->
				<th scope="col">Summe</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="(row, idx) of data" :key="idx">
				<td>{{ row.name }}</td>
				<!-- <td>{{ formatCurrency(row.soll_vk) }}</td> -->
				<td>{{ formatCurrency(row.einzelpreis_vk) }}</td>
				<!-- <td>{{ formatCurrency(row.ek_serie) }}</td>
				<td>{{ formatCurrency(row.ek) }}</td> -->
				<td>{{ row.count }}</td>
				<!-- <td>{{ formatCurrency(row.count * row.ek_serie) }}</td> -->
				<td>{{ formatCurrency(row.count * row.einzelpreis_vk) }}</td>
			</tr>
		</tbody>
	</table>
</template>

<script>
export default {
	props: [
		"data",
		"fixShelfs",
		"movableShelfs",
		"heightExtension",
		"shelfSide1",
		"shelfSide2",
	],

	watch: {
		heightExtension() {
			this.extensionCalculation();
		},
		fixShelfs() {
			this.data.lagerwand_25_fest.count = this.fixShelfs["25"];
			this.data.lagerwand_35_fest.count = this.fixShelfs["35"];

			this.extensionCalculation();
		},
		movableShelfs() {
			this.data.lagerwand_25_beweglich.count = this.movableShelfs["25"];
			this.data.lagerwand_35_beweglich.count = this.movableShelfs["35"];

			this.extensionCalculation();
		},
		shelfSide1() {
			this.shelfGuideCalculation();
		},
		shelfSide2() {
			this.shelfGuideCalculation();
		},
	},

	methods: {
		extensionCalculation() {
			// Fest 25er
			this.data.lagerwand_25_fest_höhenerweiterung.count =
				this.heightExtension * this.fixShelfs["25"];

			// Beweglich 25er
			this.data.lagerwand_25_beweglich_höhenerweiterung.count =
				this.heightExtension * this.movableShelfs["25"];

			// Fest 35er
			this.data.lagerwand_35_fest_höhenerweiterung.count =
				this.heightExtension * this.fixShelfs["35"];

			// Beweglich 35er
			this.data.lagerwand_35_beweglich_höhenerweiterung.count =
				this.heightExtension * this.movableShelfs["35"];
		},
		shelfGuideCalculation() {
			let guideSide1 = 0;
			let guideSide2 = 0;

			if (this.shelfSide1.shelf && this.shelfSide1.shelf.movable) {
				guideSide1 = this.shelfSide1.rows;
			}

			if (this.shelfSide2.shelf && this.shelfSide2.shelf.movable) {
				guideSide2 = this.shelfSide2.rows;
			}

			this.data.lagerwandführung.count = guideSide1 + guideSide2;
		},

		formatCurrency(number) {
			return new Intl.NumberFormat("de-DE", {
				style: "currency",
				currency: "EUR",
			}).format(number);
		},
	},
};
</script>

<style scoped>

</style>