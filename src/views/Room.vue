<template>
  <div class="room">
    <Audio :vedioId="Number($route.params.id)" />
  </div>
</template>

<script>
import Audio from "@/components/Audio"
export default {
  name: "Room",
  components: { Audio },
  data() {
    return {}
  },
}
</script>
