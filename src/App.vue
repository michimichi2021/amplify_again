<template>
  <div id="app" class="mx-auto mt-5">
    <authenticator>
      <template v-slot="{ user, signOut }">
        <v-title :class="['text-h6']"> Hello {{ user.username }}! </v-title>
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
            v-for="folder in todos"
            :key="folder.name"
            :title="folder.id + folder.name"
            :subtitle="folder.description"
          />
        </v-card>
      </template>
    </authenticator>
  </div>
</template>

<script setup lang="ts">
import { API } from 'aws-amplify'
import { ref, onBeforeUnmount } from 'vue'
import { createTodo, deleteTodo } from './graphql/mutations'
import type { DeleteTodoInput, DeleteTodoMutation } from './API'
import { onCreateTodo } from './graphql/subscriptions'
import { Authenticator } from '@aws-amplify/ui-vue'
import '@aws-amplify/ui-vue/styles.css'
import { listTodos } from './graphql/queries'

type Todo = {
  id: number
  name: string
  description: string
}

// reactiveにあとで直す
const name = ref('')
const description = ref('')
const todos = ref<Todo[]>([])
// let subscription: { unsubscribe: () => void }

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
  const result: any = await API.graphql({
    query: listTodos
  })
  if (result.data?.listTodos) {
    todos.value = result.data.listTodos.items as Todo[]
  } else {
    todos.value = []
  }
}

// idにもとの値を入れればデータからは消える、idの値の取り方を見つける
// ただしリアルなデータが画面で全て更新されない、リロードしたら更新される
const ClickDelete = async () => {
  const todoDetails: DeleteTodoInput = {
    id: '0d316c94-40ed-4d92-992d-23db8b8450dd'
  }
  if (!confirm('このTodoを削除してもいいですか?')) return
  await API.graphql<DeleteTodoMutation>({
    query: deleteTodo,
    variables: { input: todoDetails }
  })
}

const subscribeToDo = async () => {
  // Subscription(onCreateMessages) の実装 1 ↓
  subscription = API.graphql({ query: onCreateTodo }).subscribe({
    next: (eventData: any) => {
      let todo = eventData.value.data.onCreateTodo
      todos.value = [...todos.value, todo]
    },
    error: (error: any) => {
      console.warn(error)
    }
  })
}

onBeforeUnmount(() => {
  if (subscription) {
    // Subscription(onCreateMessages) の実装
    subscription.unsubscribe()
  }
})

getTodos()
subscribeToDo()

// const updatedTodo = async () =>{
//   const todoDetails: UpdateTodoInput = {
//   id: 'some_id',
//   name: 'Updated description',
//   description: 'Updated description'
//   };
//   await API.graphql<GraphQLQuery<UpdateTodoMutation>>({
//   query: updateTodo,
//   variables: { input: todoDetails }
//   });
// }
</script>
