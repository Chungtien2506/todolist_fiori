import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import List from "sap/m/List";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import Dialog from "sap/m/Dialog";

interface Todo {
  title: string;
  completed: boolean;
}

export default class Main extends Controller {
  private getModel(): JSONModel | undefined {
    return this.getView()?.getModel() as JSONModel | undefined;
  }

  private getListBinding(): any {
    const oList = this.byId("list") as List;
    return oList.getBinding("items");
  }

  public onInit(): void {
    const oModel = new JSONModel({
      newTodo: "",
      todos: [] as Todo[],
      searchQuery: "",
      todoToDelete: null as Todo | null,
    });
    this.getView()?.setModel(oModel);
  }

  public addTodo(): void {
    const oModel = this.getModel();
    if (oModel) {
      const sNewTodo = oModel.getProperty("/newTodo") as string;
      if (sNewTodo) {
        const todos = oModel.getProperty("/todos") as Todo[];
        todos.push({ title: sNewTodo, completed: false });
        oModel.setProperty("/todos", todos);
        oModel.setProperty("/newTodo", "");
      }
    }
  }

  public onDeleteCompleted(): void {
    const oView = this.getView();
    if (oView) {
      const oDialog = oView.byId("confirmDeleteDialog") as Dialog;
      oDialog.open();
    }
  }

  public onConfirmDelete(): void {
    const oModel = this.getModel();
    if (oModel) {
      let todos = oModel.getProperty("/todos") as Todo[];
      const todoToDelete = oModel.getProperty("/todoToDelete") as Todo | null;
      if (todoToDelete) {
        todos = todos.filter((todo) => todo !== todoToDelete);
        oModel.setProperty("/todoToDelete", null);
      } else {
        todos = todos.filter((todo) => !todo.completed);
      }
      oModel.setProperty("/todos", todos);
    }
    this.onCancelDelete();
  }

  public onCancelDelete(): void {
    const oView = this.getView();
    if (oView) {
      const oDialog = oView.byId("confirmDeleteDialog") as Dialog;
      oDialog.close();
    }
  }

  public onSearch(): void {
    const sQuery = this.byId("searchField").getValue();
    const oModel = this.getModel();
    if (oModel) {
      const oFilter = new Filter("title", FilterOperator.Contains, sQuery);
      const oBinding = this.getListBinding();
      if (oBinding) {
        oBinding.filter(sQuery ? oFilter : []);
      }
      oModel.setProperty("/searchQuery", sQuery);
    }
  }

  public showAllTodos(): void {
    const oBinding = this.getListBinding();
    if (oBinding) {
      oBinding.filter([]);
    }
  }

  public showActiveTodos(): void {
    const oModel = this.getModel();
    if (oModel) {
      const oBinding = this.getListBinding();
      if (oBinding) {
        const oFilter = new Filter("completed", FilterOperator.EQ, false);
        oBinding.filter([oFilter]);
      }
    }
  }

  public showCompletedTodos(): void {
    const oModel = this.getModel();
    if (oModel) {
      const oBinding = this.getListBinding();
      if (oBinding) {
        const oFilter = new Filter("completed", FilterOperator.EQ, true);
        oBinding.filter([oFilter]);
      }
    }
  }

  public onDeleteTodo(event: Event): void {
    const oModel = this.getModel();
    const todo = event.getSource().getBindingContext().getObject() as Todo;
    oModel.setProperty("/todoToDelete", todo);

    const oView = this.getView();
    if (oView) {
      const oDialog = oView.byId("confirmDeleteDialog") as Dialog;
      oDialog.open();
    }
  }
}
