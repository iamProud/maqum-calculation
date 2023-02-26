<template>
    <Tile>
        <table class="table">
            <thead>
                <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Value</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>dimension.length</td>
                    <td>{{ dimension.length }}</td>
                </tr>
                <tr>
                    <td>dimension.width</td>
                    <td>{{ dimension.width }}</td>
                </tr>
                <tr>
                    <td>dimension.height</td>
                    <td>{{ dimension.height }}</td>
                </tr>
                <tr>
                    <td>mashineDimensions.width</td>
                    <td>{{ mashineDimensions.width }}</td>
                </tr>
                <tr>
                    <td>mashineDimensions.length</td>
                    <td>{{ mashineDimensions.length }}</td>
                </tr>
                <tr>
                    <td>einlagerungsmodulSize.width</td>
                    <td>{{ einlagerungsmodulSize.width }}</td>
                </tr>
                <tr>
                    <td>einlagerungsmodulSize.depth</td>
                    <td>{{ einlagerungsmodulSize.depth }}</td>
                </tr>
            </tbody>
        </table>
    </Tile>
</template>

<script>
export default {
    props: {
        dimension: {
            type: Object,
        },
        mashineDimensions: {
            type: Object,
        },
        einlagerungsmodulSize: {
            type: Object,
        },
    },
};
</script>

<style scoped></style>
