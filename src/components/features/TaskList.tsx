import { useState } from 'react'
import { Plus, CheckSquare, Calendar, Flag, Trash2, Edit3, Tag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Label } from "../ui/label"
import { Checkbox } from "../ui/checkbox"
import { Badge } from "../ui/badge"
import { useTasks } from '../../hooks/useBackendData'
import { toast } from 'sonner@2.0.3'

interface TaskFormData {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  due_date: string
  category: string
  tags: string[]
}

export function TaskList() {
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks()
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    category: '',
    tags: []
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Please enter a task title')
      return
    }

    try {
      if (editingTask) {
        const result = await updateTask(editingTask, {
          ...formData,
          due_date: formData.due_date || null
        })
        if (result.success) {
          toast.success('Task updated successfully!')
        } else {
          toast.error(result.error || 'Failed to update task')
        }
        setEditingTask(null)
      } else {
        const result = await createTask({
          ...formData,
          due_date: formData.due_date || null
        })
        if (result.success) {
          toast.success('Task created successfully!')
        } else {
          toast.error(result.error || 'Failed to create task')
        }
        setIsAddingTask(false)
      }
      
      // Reset form
      resetForm()
    } catch (error) {
      console.error('Error submitting task:', error)
      toast.error('An unexpected error occurred')
    }
  }

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      const result = await updateTask(taskId, { completed })
      if (result.success) {
        toast.success(completed ? 'Task completed!' : 'Task marked as incomplete')
      } else {
        toast.error(result.error || 'Failed to update task')
      }
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const result = await deleteTask(taskId)
      if (result.success) {
        toast.success('Task deleted successfully!')
      } else {
        toast.error(result.error || 'Failed to delete task')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    }
  }

  const handleEditTask = (task: any) => {
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'medium',
      due_date: task.due_date || '',
      category: task.category || '',
      tags: task.tags || []
    })
    setEditingTask(task.id)
    setIsAddingTask(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
      category: '',
      tags: []
    })
    setTagInput('')
    setEditingTask(null)
    setIsAddingTask(false)
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
      case 'low': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
    }
  }

  const pendingTasks = tasks.filter(task => !task.completed)
  const completedTasks = tasks.filter(task => task.completed)

  if (loading) {
    return (
      <Card className="glassmorphism border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-solid"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glassmorphism border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5" />
          Tasks ({pendingTasks.length} pending)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Task Button */}
        <Dialog open={isAddingTask} onOpenChange={(open) => {
          if (!open) resetForm()
          setIsAddingTask(open)
        }}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start glassmorphism">
              <Plus className="w-4 h-4 mr-2" />
              Add New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="glassmorphism">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
              <DialogDescription>
                {editingTask ? 'Modify your task details below.' : 'Create a new task to help organize your work.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter task title"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value: 'high' | 'medium' | 'low') => 
                      setFormData({...formData, priority: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="due_date">Due Date (Optional)</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category (Optional)</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="e.g., Work, Personal, Study"
                />
              </div>

              <div>
                <Label>Tags (Optional)</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline" size="sm">
                      Add
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:bg-red-500 hover:text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingTask ? 'Update Task' : 'Add Task'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Pending Tasks */}
        <div className="space-y-3">
          {pendingTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No pending tasks. Add one to get started!</p>
            </div>
          ) : (
            pendingTasks.map((task) => (
              <div key={task.id} className="group flex items-start gap-3 p-3 glass-card hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={(checked) => handleToggleComplete(task.id, checked as boolean)}
                  className="mt-1"
                />
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{task.title}</p>
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      <Flag className="w-3 h-3 mr-1" />
                      {task.priority}
                    </Badge>
                    {task.category && (
                      <Badge variant="outline" className="text-xs">
                        {task.category}
                      </Badge>
                    )}
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {task.due_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    )}
                    
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <div className="flex gap-1">
                          {task.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                              {tag}
                            </Badge>
                          ))}
                          {task.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              +{task.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTask(task)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="border-t border-white/20 pt-4 mt-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Completed ({completedTasks.length})
            </h4>
            <div className="space-y-2">
              {completedTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-2 glass-card opacity-75">
                  <Checkbox
                    checked={true}
                    onCheckedChange={() => handleToggleComplete(task.id, false)}
                  />
                  <div className="flex-1">
                    <p className="text-sm line-through text-muted-foreground">{task.title}</p>
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {task.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs px-1 py-0 opacity-60">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {completedTasks.length > 3 && (
                <p className="text-sm text-muted-foreground">
                  +{completedTasks.length - 3} more completed tasks
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}