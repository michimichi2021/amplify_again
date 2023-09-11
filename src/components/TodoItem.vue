<template>
  <v-container id="app" class="mx-auto mt-5">
    <v-container v-if="!user.username">
      <v-card-title v-if="isSignUpMode">新規登録画面</v-card-title>
      <v-card-title v-if="!isSignUpMode">ログイン画面</v-card-title>
      <v-btn class="mr-2" color="success" v-on:click="toggleSignUpMode"
        >切り替えボタン ログイン/新規登録</v-btn
      >
      <v-container class="mt-5">
        <v-container v-if="isSignUpMode">
          <v-row>
            <v-col cols="12" md="3">
              <v-text-field v-model="username" :counter="10" label="名前" required></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field v-model="email" label="メールアドレス" required></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="password"
                :counter="10"
                label="パスワード"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-btn
                class="mr-2 mx-auto"
                color="success"
                v-on:click="signUp(username, email, password)"
                >新規登録</v-btn
              >
            </v-col>
          </v-row>
        </v-container>
        <v-container v-if="!isSignUpMode">
          <v-row>
            <v-col cols="12" md="3">
              <v-text-field v-model="username" :counter="10" label="名前" required></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="password"
                :counter="10"
                label="パスワード"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-btn class="mr-2" color="success" v-on:click="signIn(username, password)"
                >ログイン</v-btn
              >
            </v-col>
          </v-row>
        </v-container>
        <v-container v-if="!isConfirmationMode && isSignUpMode">
          <v-row>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="confirmationCode"
                :counter="10"
                label="確認コード"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-btn color="success" v-on:click="confirmSignUp(username, confirmationCode)"
                >2段階認証する</v-btn
              >
            </v-col>
          </v-row>
        </v-container>
      </v-container>
    </v-container>
    <v-container v-if="user.username">
      <v-card-title>
        Hello {{ user.username }}! <v-btn v-on:click="signOut">Sign Out</v-btn></v-card-title
      >
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
          <v-spacer></v-spacer>
          <v-btn variant="text" icon="mdi-magnify"></v-btn>
        </v-toolbar>
        <v-card-title class="text-center">実行中</v-card-title>
        <v-list-item v-for="todo in todos" :key="todo.id">
          <li class="list-group-item list-group-item-action" v-if="!todo.completed">
            題名:{{ todo.name }}
            <hr />
            内容:{{ todo.description }}
            <hr />
            <v-btn v-if="!todo.completed" v-on:click="CompletedTodo(todo)">完了</v-btn>
          </li>
        </v-list-item>
        <v-card-title class="text-center">完了済み</v-card-title>
        <v-list-item v-for="todo in todos" :key="todo.id">
          <li class="list-group-item list-group-item-action" v-if="todo.completed">
            題名:{{ todo.name }}
            <hr />
            内容:{{ todo.description }}
            <hr />
            <v-btn v-on:click="ClickDelete(todo.id)">削除</v-btn>
          </li>
        </v-list-item>
      </v-card>
    </v-container>
  </v-container>
</template>

<script setup lang="ts">
import { API, Auth } from 'aws-amplify'
import { reactive, ref, toRefs } from 'vue'
import { createTodo, deleteTodo, updateTodo } from '../graphql/mutations'
import type {
  Todo,
  ListTodosQuery,
  CreateTodoMutation,
  DeleteTodoInput,
  DeleteTodoMutation,
  UpdateTodoMutation,
  UpdateTodoInput
} from '../API'
import '@aws-amplify/ui-vue/styles.css'
import { listTodos } from '../graphql/queries'
import type { GraphQLQuery, GraphQLResult } from '@aws-amplify/api'

const user = reactive({ username: null as string | null })
const username = ref('')
const password = ref('')
const email = ref('')
const isSignUpMode = ref(false)

const toggleSignUpMode = () => {
  isSignUpMode.value = !isSignUpMode.value
}

const confirmationCode = ref('')
const isConfirmationMode = ref(true)

const signUp = async (usernameParam: string, emailParam: string, passwordParam: string) => {
  try {
    const data = await Auth.signUp({
      username: usernameParam,
      password: passwordParam,
      attributes: {
        email: emailParam
      }
    })
    console.log(data)
    isConfirmationMode.value = !isConfirmationMode.value
  } catch (err) {
    console.log(err)
  }
}

const confirmSignUp = async (usernameParam: string, confirmationCodeParam: string) => {
  try {
    await Auth.confirmSignUp(usernameParam, confirmationCodeParam)
    isSignUpMode.value = !isSignUpMode.value
    username.value = ''
    email.value = ''
    password.value = ''
    confirmationCode.value = ''
  } catch (err) {
    console.log(err)
  }
}

const signIn = async (usernameParam: string, passwordParam: string) => {
  try {
    await Auth.signIn(usernameParam, passwordParam)
    user.username = usernameParam
    username.value = ''
    password.value = ''
  } catch (err) {
    console.log(err)
  }
}

const signOut = async () => {
  try {
    await Auth.signOut()
    user.username = null
  } catch (err) {
    console.log(err)
  }
}

const todo = reactive({
  name: '',
  description: '',
  completed: false
})
let { name, description } = toRefs(todo)

const todos = ref<Todo[]>([])

const getTodos = async () => {
  const result = (await API.graphql({
    query: listTodos
  })) as GraphQLResult<ListTodosQuery>
  if (result.data?.listTodos) {
    todos.value = result.data.listTodos.items as Todo[]
  } else {
    todos.value = []
  }
}

const ClickCreate = async () => {
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

  const result: any | null | undefined = await API.graphql<GraphQLQuery<DeleteTodoMutation>>({
    query: deleteTodo,
    variables: { input: todoDetails }
  })
  let TodoDelete = result.data.deleteTodo
  todos.value = todos.value.filter((td) => td.id != TodoDelete.id)
}

const CompletedTodo = async (todoUpdate: Todo) => {
  const updateTodoDetail: UpdateTodoInput = {
    id: todoUpdate.id,
    name: todoUpdate.name,
    description: todoUpdate.description,
    completed: true
  }

  const result: any | undefined = await API.graphql<GraphQLQuery<UpdateTodoMutation>>({
    query: updateTodo,
    variables: { input: updateTodoDetail }
  })
  let todo = result.data.updateTodo
  todos.value = todos.value.filter((td) => td.id != todo.id)
  getTodos()
}

getTodos()
</script>
