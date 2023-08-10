<template>
  <div id="app" class="mx-auto mt-5">
    <authenticator>
      <template v-slot="{ user, signOut }">
        <v-title> Hello {{ user.username }}! </v-title>
        <v-btn @click="signOut">Sign Out</v-btn>
        <v-card class="mx-auto mt-10" max-width="1000">
          <v-card-title class="text-center">Todo App</v-card-title>
          <v-form>
            <v-container>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field v-model="name" :counter="10" label="題名" required></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="description"
                    :counter="10"
                    label="内容"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-btn v-on:click="ClickCreate">Create Todo</v-btn>
            </v-container>
          </v-form>
          <v-toolbar color="cyan-lighten-1">
            <v-btn variant="text" icon="mdi-menu"></v-btn>
            <v-toolbar-title>todoリスト</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn variant="text" icon="mdi-magnify"></v-btn>
          </v-toolbar>
          <v-list-item
            v-for="todo in todos"
            :key="todo.id"
            :title="todo.id + todo.name"
            :subtitle="todo.description"
          >
            <v-btn v-on:click="ClickDelete(todo.id)">削除</v-btn>
          </v-list-item>
        </v-card>
      </template>
    </authenticator>
  </div>
</template>

<script setup lang="ts">
import { API } from 'aws-amplify'
import { ref } from 'vue'
import { createTodo, deleteTodo } from './graphql/mutations'
import type { CreateTodoMutation, DeleteTodoInput, DeleteTodoMutation } from './API'
import { Authenticator } from '@aws-amplify/ui-vue'
import '@aws-amplify/ui-vue/styles.css'
import { listTodos } from './graphql/queries'
import { GraphQLQuery } from '@aws-amplify/api'

type Todo = {
  id: string
  name: string
  description?: string | null
}
const name = ref('')
const description = ref('')
const todos = ref<Todo[]>([])

const getTodos = async () => {
  const result: any = await API.graphql({
    query: listTodos
  })
  if (result.data?.listTodos) {
    todos.value = result.data.listTodos.items as Todo[]
  } else {
    todos.value = []
  }
}

const ClickCreate = async () => {
  if (!name.value || !description.value) return
  const todo = { name: name.value, description: description.value }
  await API.graphql<GraphQLQuery<CreateTodoMutation>>({
    query: createTodo,
    variables: { input: todo }
  })
  getTodos()
  name.value = ''
  description.value = ''
}

const ClickDelete = async (todoId: string) => {
  if (!confirm('このTodoを削除してもいいですか?')) return
  const todoDetails: DeleteTodoInput = {
    id: todoId
  }

  const result = await API.graphql<GraphQLQuery<DeleteTodoMutation>>({
    query: deleteTodo,
    variables: { input: todoDetails }
  })
  let todo = result.data.deleteTodo
  todos.value = todos.value.filter((td) => td.id != todo.id)
}
getTodos()
</script>
