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
            <p>{{ item.id }}</p>
            <h3>{{ item.name }}</h3>
            <p>{{ item.description }}</p>
            <button v-on:click="ClickDelete">Delete Todo</button>
          </div>
        </div>
      </template>
    </authenticator>
  </div>
</template>

<script setup lang="ts">
import { API } from 'aws-amplify'
import { GraphQLQuery } from '@aws-amplify/api'
import { ref, onBeforeUnmount } from 'vue'
import { createTodo, deleteTodo} from './graphql/mutations'
import { DeleteTodoInput, DeleteTodoMutation } from './API'
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
let subscription: { unsubscribe: () => void }

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

// idにもとの値を入れればデータからは消える、idの値の取り方を見つける
// ただしリアルなデータが画面で全て更新されない、リロードしたら更新される
const ClickDelete = async () => {
  const todoDetails: DeleteTodoInput = {
    id: '25627473-27d8-45e4-a697-d72a4d794fd5'
  }
  if (!confirm('このTodoを削除してもいいですか?')) return
  await API.graphql<GraphQLQuery<DeleteTodoMutation>>({
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
