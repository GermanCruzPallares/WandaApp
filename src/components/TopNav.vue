<template>
  <div class="header-nav">
    <div class="header-nav__logo">
      <img src="../images/OscuroReducido.png" alt="Logo" class="logo-image" />
    </div>
    
    <div class="header-nav__avatar">
      <img 
        :src="avatarSrc" 
        alt="User avatar"
        class="avatar-image"
        @click="handleAvatarClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  avatarSrc?: string;
}

const props = withDefaults(defineProps<Props>(), {
  avatarSrc: 'https://i.pravatar.cc/150?img=5'
});



const emit = defineEmits<{
  avatarClick: [];
}>();

const handleAvatarClick = () => {
  emit('avatarClick');
};
</script>

<style scoped lang="scss">
.header-nav {
  background-color: #e5e5e5;
  padding: 20px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  
  &__logo {
    .logo-image {
      width: 40px;
      height: 40px;
      display: block;
      border-radius: 8px;
    }
  }
  
  &__avatar {
    cursor: pointer;
    
    .avatar-image {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      display: block;
    }
  }
}
</style>