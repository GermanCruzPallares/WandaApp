<script setup lang="ts"></script>

<template>

<div class="contact-page">

            <div class="contact-page__container">

                <section class="intro">
                    <h1 class="intro__title">
                        Tu opinión <br> nos importa
                    </h1>
                    <p class="intro__subtitle">
                        Comparte tus ideas y preguntas con nuestro equipo.
                    </p>
                </section>

                <form class="form-card">

                    <div class="form-card__group">
                        <label for="name" class="form-card__label">Nombre</label>
                        <input type="text" id="name" name="name" class="form-card__input" placeholder="Valor">
                    </div>

                    <div class="form-card__group">
                        <label for="surname" class="form-card__label">Apellido</label>
                        <input type="text" id="surname" name="surname" class="form-card__input " placeholder="Valor">
                    </div>

                    <div class="form-card__group">
                        <label for="email" class="form-card__label">Email</label>
                        <input type="email" id="email" name="email" class="form-card__input" placeholder="Valor">
                    </div>

                    <div class="form-card__group">
                        <label for="message" class="form-card__label">Mensaje</label>
                        <textarea id="message" name="message" class="form-card__input form-card__input--textarea"
                            placeholder="Valor"></textarea>
                    </div>

                    <div class="form-card__actions">
                        <button type="submit" class="form-card__button">Enviar</button>
                    </div>

                </form>
            </div>
        </div>


</template>