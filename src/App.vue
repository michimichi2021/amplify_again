<template>
  <div id="app">
    <authenticator>
      <template v-slot="{ user, signOut }">
        <div class="container">
          <div class="title">
            <h1>Hello {{ user.username }}!</h1>
            <br />
            <button @click="signOut">Sign Out</button>
            <h1>Todo App</h1>
          </div>
          <div>
            <input type="text" v-model="name" placeholder="Todo name" />
            <input type="text" v-model="description" placeholder="Todo description" />
            <button v-on:click="ClickCreate">Create Todo</button>
          </div>
          <div v-for="item in todos" :key="item.id">
            <h3>{{ item.name }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </template>
    </authenticator>
  </div>
</template>

<script setup lang="ts">
import { API } from 'aws-amplify'
import { ref } from 'vue'
import { createTodo } from './graphql/mutations'
import { Authenticator } from '@aws-amplify/ui-vue'
import '@aws-amplify/ui-vue/styles.css'
import { listTodos } from './graphql/queries'

type Todo = {
  id: number
  name: string
  description: string
}

const name = ref('')
const description = ref('')
const todos = ref<Todo[]>([])

const ClickCreate = async () => {
  if (!name.value || !description.value) return
  const todo = { name: name.value, description: description.value }
  await API.graphql({
    query: createTodo,
    variables: { input: todo }
  })
  name.value = ''
  description.value = ''
}

const getTodos = async () => {
  const result = await API.graphql({
    query: listTodos
  })
  if (result.data?.listTodos) {
    todos.value = result.data.listTodos.items as Todo[]
  } else {
    todos.value = []
  }
}
getTodos()
</script>
