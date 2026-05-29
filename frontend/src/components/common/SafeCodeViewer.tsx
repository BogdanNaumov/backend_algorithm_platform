import React, { useEffect, useState } from 'react';

interface Props {
  code: string;
  language?: string;
  height?: string;
  isDark?: boolean;
}

const SafeCodeViewer: React.FC<Props> = ({ code, language = 'C++', height = '260px', isDark = false }) => {
  const [CmComp, setCmComp] = useState<any>(null);
  const [ext, setExt] = useState<any>(null);
  const [theme, setTheme] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [{ default: CodeMirror }, langCpp, langJava, langPython, themeOneDark] = await Promise.all([
          import('@uiw/react-codemirror'),
          import('@codemirror/lang-cpp'),
          import('@codemirror/lang-java'),
          import('@codemirror/lang-python'),
          import('@codemirror/theme-one-dark')
        ]);

        if (!mounted) return;
        setCmComp(() => CodeMirror.default || CodeMirror);
        const cpp = langCpp.cpp || langCpp;
        const java = langJava.java || langJava;
        const python = langPython.python || langPython;
        setExt(() => (language === 'C++' ? cpp() : language === 'Java' ? java() : python()));
        setTheme(() => themeOneDark.oneDark || themeOneDark);
      } catch (err) {
        // dynamic import failed — leave CmComp null to render fallback
        console.warn('CodeMirror dynamic import failed, falling back to <pre>', err);
      }
    })();
    return () => { mounted = false; };
  }, [language]);

  if (!CmComp) {
    return (
      <pre className="code-block" style={{ height, overflow: 'auto' }}>
        <code>{code}</code>
      </pre>
    );
  }

  const CodeMirror = CmComp;

  return (
    <CodeMirror
      value={code}
      height={height}
      theme={isDark ? theme : undefined}
      extensions={[ext]}
      editable={false}
      basicSetup={{ lineNumbers: true, syntaxHighlighting: true }}
    />
  );
};

export default SafeCodeViewer;
