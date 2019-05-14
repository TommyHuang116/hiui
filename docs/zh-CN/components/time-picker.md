## 时间选择器

### 基础

:::demo 

```js
render() {
  return (
    <div style={{display:'flex', flexWrap: 'wrap'}}>
      <div style={{margin: '10px'}}>
        <p>时间选择</p>
        <TimePicker
          value={new Date()}
          format="HH:mm"
          onChange={date => console.log('时间', date)}
        />
      </div>
      <div style={{margin: '10px'}}>
        <p>时间范围选择</p>
        <TimePicker
          value={new Date()}
          type="timerange"
          format="HH:mm"
          onChange={date => console.log('时间范围', date)}
        />
      </div>
    </div>
  )
}
```
:::


### Timepicker Events

| 参数      | 说明   | 回调参数 | 说明 |
| -------- | ----- | ---- | ----  |
| onChange | 选中回调函数 | (date: Date) |  - |
