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
        {/*= "Worldです1" */}
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
    3,div           ,
    5,___:div       ,Helloです
    8,___:div       ,True の場合
   12,___:div       ,False の場合1\nFalse の場合2
   14,___:header    ,
   17,___:______:div,\"Worldです1\"\nWorldです2
```
