<template>
  <div id="app" class="mx-auto mt-5">
    <authenticator>
      <template v-slot="{ user, signOut }">
        <v-title> Hello {{ user.username }}! </v-title>
        <v-btn v-on:click="signOut">Sign Out</v-btn>
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
            <v-li class="list-group-item list-group-item-action" v-if="!todo.completed">
              題名:{{ todo.name }}
              <hr />
              内容:{{ todo.description }}
              <hr />
              <v-btn v-if="!todo.completed" v-on:click="CompletedTodo(todo)">完了</v-btn>
            </v-li>
          </v-list-item>
          <v-card-title class="text-center">完了済み</v-card-title>
          <v-list-item v-for="todo in todos" :key="todo.id">
            <v-li class="list-group-item list-group-item-action" v-if="todo.completed">
              題名:{{ todo.name }}
              <hr />
              内容:{{ todo.description }}
              <hr />
              <v-btn v-on:click="ClickDelete(todo.id)">削除</v-btn>
            </v-li>
          </v-list-item>
        </v-card>
      </template>
    </authenticator>
  </div>
</template>

<script setup lang="ts">
import { API } from 'aws-amplify'
import { reactive, ref, toRefs } from 'vue'
import { createTodo, deleteTodo, updateTodo } from './graphql/mutations'
import type {
  Todo,
  ListTodosQuery,
  CreateTodoMutation,
  DeleteTodoInput,
  DeleteTodoMutation,
  UpdateTodoMutation,
  UpdateTodoInput
} from './API'
import { Authenticator } from '@aws-amplify/ui-vue'
import '@aws-amplify/ui-vue/styles.css'
import { listTodos } from './graphql/queries'
import { GraphQLQuery,GraphQLResult } from '@aws-amplify/api'

const todo = reactive({
  name: '',
  description: '',
  completed: false
})
let { name, description } = toRefs(todo)

const todos = ref<Todo[]>([])

const getTodos = async () => {
  const result = await API.graphql({
    query: listTodos
  }) as GraphQLResult<ListTodosQuery>;
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

  const result = await API.graphql<GraphQLQuery<DeleteTodoMutation>>({
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

  const result = await API.graphql<GraphQLQuery<UpdateTodoMutation>>({
    query: updateTodo,
    variables: { input: updateTodoDetail }
  })
  let todo = result.data.updateTodo
  todos.value = todos.value.filter((td) => td.id != todo.id)
  getTodos()
}

getTodos()
</script>
