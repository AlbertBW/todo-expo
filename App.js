import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  Button,
} from "react-native";
import { useState, useEffect } from "react";
import * as SQLite from "expo-sqlite";

export default function App() {
  const db = SQLite.openDatabase("todoapp.db");
  const [isLoading, setIsLoading] = useState(true);
  const [task, setTask] = useState();
  const [taskItems, setTaskItems] = useState([]);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS taskItems (id INTEGER PRIMARY KEY AUTOINCREMENT, task TEXT)"
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM taskItems",
        null,
        (txObj, resultSet) => setTaskItems(resultSet.rows._array),
        (txObj, error) => console.log(error)
      );
    });

    setIsLoading(false);
  }, [handleAddTask]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.tasksWrapper}>Loading Todos...</Text>
      </View>
    );
  }

  function handleAddTask() {
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO taskItems (task) values (?)",
        [task],
        (resultSet) => {
          let itemsCopy = [...taskItems];
          itemsCopy.push({ id: resultSet.insertId, name: task });
          setTaskItems(itemsCopy);
          setTask(null);
        },
        (error) => console.log(error)
      );
    });
    Keyboard.dismiss();
  }

  function deleteTask(id) {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM taskItems WHERE id = ?",
        [id],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            let itemsCopy = [...taskItems].filter((task) => task.id !== id);
            setTaskItems(itemsCopy);
          }
        },
        (error) => console.log(error)
      );
    });
  }

  function Task(task) {
    return (
      <View style={styles.item}>
        <View style={styles.itemLeft}>
          <View style={styles.square}></View>
          <Text style={styles.itemText}>{task.task}</Text>
        </View>
        <View style={styles.circular}></View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Today's tasks */}
      <View style={styles.tasksWrapper}>
        <Text style={styles.sectionTitle}>Today's tasks</Text>
        <View style={styles.items}>
          {taskItems.map((task, index) => (
            <TouchableOpacity key={index} onPress={() => deleteTask(task.id)}>
              {Task(task)}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.writeTaskWrapper}
      >
        <TextInput
          style={styles.input}
          placeholder={"Write a task"}
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity
          onPress={() => handleAddTask()}
          disabled={task === null}
        >
          <View style={styles.addWrapper}>
            <Text style={styles.addText}>+</Text>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8EAED",
  },
  tasksWrapper: {
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  items: {
    marginTop: 30,
  },
  writeTaskWrapper: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  input: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: "#FFF",
    borderRadius: 60,
    borderColor: "#C0C0C0",
    borderWidth: 1,
    width: 250,
  },
  addWrapper: {
    width: 60,
    height: 60,
    backgroundColor: "#FFF",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#C0C0C0",
    borderWidth: 1,
  },
  addText: {},
  item: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  square: {
    width: 24,
    height: 24,
    backgroundColor: "#55BCF6",
    opacity: 0.4,
    borderRadius: 5,
    marginRight: 15,
  },
  itemText: {
    maxWidth: "80%",
  },
  circular: {
    width: 12,
    height: 12,
    borderColor: "#55BCF6",
    borderWidth: 2,
    borderRadius: 5,
  },
});
