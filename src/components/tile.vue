<template>
	<div>
		<div class="px-5 pt-3 pb-4 mq-tile">
			<h3 v-if="title" class="mb-4 text-center fw-bold">{{ title }}</h3>
			<slot></slot>
		</div>
	</div>
</template>

<script>
export default {
	props: ["title"],

	data() {
		return {};
	},
};
</script>

<style scoped>
.mq-tile {
	border: 1px solid black;
	box-shadow: 10px 10px 0px 0px gray;
	border-radius: 10px 10px 10px 0;
	margin: 0 10px 30px 0px;
}
</style>
