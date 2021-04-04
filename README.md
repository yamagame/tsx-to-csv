# JSX to CSV

JSX の構造を CSV として書き出すツール

## 入力

```jsx
function main() {
  return (
    <div>
      {/*= Helloです */}
      <div>Hello</div>
      {true ? (
        //= True の場合
        <div>True</div>
      ) : (
        //= False の場合1
        //= False の場合2
        <div>False</div>
      )}
      <header>
        {/*= Worldです1 */}
        {/*= Worldです2 */}
        <div>World</div>
      </header>
    </div>
  );
}
```

## 出力

```csv
,,,test.tsx
    3,<div>
    5,_____|<div>         ,Helloです
    8,_____|<div>         ,True の場合
   12,_____|<div>         ,False の場合1,False の場合2
   14,_____|<header>      ,
   17,_____|________|<div>,Worldです1,Worldです2
```
