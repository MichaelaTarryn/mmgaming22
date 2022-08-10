<template>
  <div id="carousel-con" class="carousel slide" data-bs-ride="carousel">
    <div class="carousel-inner">
      <div class="carousel-item active"  v-for="slides in slide" :key="slides">
        <img :src="slides.img" class="d-block w-100" alt="..." />
      </div>
    </div>
    <button id="click"
      class="carousel-control-prev"
      type="button"
      data-bs-target="#carousel-con"
      data-bs-slide="prev"
    >
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Previous</span>
    </button>
    <button id="click"
      class="carousel-control-next"
      type="button"
      data-bs-target="#carousel-con"
      data-bs-slide="next"
    >
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Next</span>
    </button>
  </div>
</template>

<script>
export default {
computed: {
    slide() {
      return this.$store.state.slide;
    },
  },
}
</script>

<style>
#click {
    width: 5%;
}
</style>