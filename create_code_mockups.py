import os

code_template = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0;
    padding: 15px;
    background: #0f172a;
    font-family: 'Consolas', 'Courier New', monospace;
    display: flex;
    justify-content: center;
  }
  .window {
    width: 900px;
    background: #1e1e1e;
    border: 1px solid #334155;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    overflow: hidden;
  }
  .titlebar {
    background: #252526;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #333;
    font-size: 12px;
    color: #cccccc;
  }
  .dots {
    display: flex;
    gap: 6px;
  }
  .dot {
    width: 11px;
    height: 11px;
    border-radius: 50%;
  }
  .dot-red { background: #ff5f56; }
  .dot-yellow { background: #ffbd2e; }
  .dot-green { background: #27c93f; }
  .tabs {
    background: #2d2d2d;
    display: flex;
    border-bottom: 1px solid #1e1e1e;
  }
  .tab {
    padding: 7px 16px;
    background: #1e1e1e;
    color: #ffffff;
    font-size: 12px;
    border-right: 1px solid #252526;
    border-top: 2px solid #007acc;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .code-area {
    padding: 14px;
    font-size: 12px;
    line-height: 1.55;
    color: #d4d4d4;
    overflow-x: auto;
  }
  .kw { color: #569cd6; font-weight: bold; }
  .str { color: #ce9178; }
  .fn { color: #dcdcaa; }
  .num { color: #b5cea8; }
  .comment { color: #6a9955; font-style: italic; }
  .type { color: #4ec9b0; }
  .var { color: #9cdcfe; }
  .line-num {
    display: inline-block;
    width: 32px;
    color: #858585;
    user-select: none;
    text-align: right;
    margin-right: 14px;
  }
</style>
</head>
<body>
<div class="window">
  <div class="titlebar">
    <div class="dots">
      <div class="dot dot-red"></div>
      <div class="dot dot-yellow"></div>
      <div class="dot dot-green"></div>
    </div>
    <div style="font-weight: 500;">__TITLE__</div>
    <div style="color: #64748b; font-size: 11px;">SpellSense NLP Suite</div>
  </div>
  <div class="tabs">
    <div class="tab">
      <span>📄</span>
      <span>__FILENAME__</span>
    </div>
  </div>
  <div class="code-area">
    __CONTENT__
  </div>
</div>
</body>
</html>
"""

mockups = [
    {
        "id": "fig5_1_project_structure",
        "title": "SpellSense Project Architecture - Directory Hierarchy",
        "filename": "workspace_tree.txt",
        "lines": [
            ("1", '<span class="comment"># SpellSense Project Directory Hierarchy</span>'),
            ("2", '<span class="kw">spellsense/</span>'),
            ("3", '├── <span class="var">backend/</span>                  <span class="comment"># FastAPI REST Engine & NLP Core</span>'),
            ("4", '│   ├── <span class="var">app/</span>'),
            ("5", '│   │   ├── <span class="fn">main.py</span>              <span class="comment"># Application entry point, CORS & lifespan</span>'),
            ("6", '│   │   ├── <span class="var">api/endpoints/</span>'),
            ("7", '│   │   │   ├── <span class="fn">correction.py</span>    <span class="comment"># /api/correct & /api/analyze-word endpoints</span>'),
            ("8", '│   │   │   └── <span class="fn">system.py</span>        <span class="comment"># Health status & vocabulary diagnostics</span>'),
            ("9", '│   │   ├── <span class="var">services/</span>'),
            ("10", '│   │   │   └── <span class="fn">spelling_service.py</span> <span class="comment"># TextBlob & SymSpell singleton engine</span>'),
            ("11", '│   │   └── <span class="var">models/schemas.py</span>    <span class="comment"># Pydantic request & response schemas</span>'),
            ("12", '│   └── <span class="var">requirements.txt</span>         <span class="comment"># fastapi, uvicorn, textblob, symspellpy</span>'),
            ("13", '└── <span class="var">frontend/</span>                 <span class="comment"># React 19 + TypeScript Single Page App</span>'),
            ("14", '    ├── <span class="var">src/</span>'),
            ("15", '    │   ├── <span class="var">pages/</span>'),
            ("16", '    │   │   ├── <span class="fn">CorrectorPage.tsx</span> <span class="comment"># Interactive workspace with tabbed results</span>'),
            ("17", '    │   │   ├── <span class="fn">HomePage.tsx</span>      <span class="comment"># Landing presentation & live teaser</span>'),
            ("18", '    │   │   └── <span class="fn">HowItWorksPage.tsx</span> <span class="comment"># Educational algorithm comparisons</span>'),
            ("19", '    │   ├── <span class="var">services/api.ts</span>      <span class="comment"># Strongly-typed HTTP fetch service</span>'),
            ("20", '    │   └── <span class="var">types/index.ts</span>        <span class="comment"># TypeScript data contracts & models</span>'),
            ("21", '    └── <span class="var">package.json</span>             <span class="comment"># react, react-router-dom, lucide-react, vite</span>')
        ]
    },
    {
        "id": "fig5_2_main_application",
        "title": "FastAPI Core Application & Lifespan - backend/app/main.py",
        "filename": "main.py",
        "lines": [
            ("1", '<span class="kw">from</span> <span class="var">contextlib</span> <span class="kw">import</span> <span class="fn">asynccontextmanager</span>'),
            ("2", '<span class="kw">from</span> <span class="var">fastapi</span> <span class="kw">import</span> <span class="type">FastAPI</span>'),
            ("3", '<span class="kw">from</span> <span class="var">fastapi.middleware.cors</span> <span class="kw">import</span> <span class="type">CORSMiddleware</span>'),
            ("4", '<span class="kw">from</span> <span class="var">app.api.endpoints</span> <span class="kw">import</span> <span class="var">correction</span>, <span class="var">system</span>'),
            ("5", '<span class="kw">from</span> <span class="var">app.services.spelling_service</span> <span class="kw">import</span> <span class="var">spelling_service</span>'),
            ("6", ''),
            ("7", '<span class="kw">@asynccontextmanager</span>'),
            ("8", '<span class="kw">async def</span> <span class="fn">lifespan</span>(<span class="var">app</span>: <span class="type">FastAPI</span>):'),
            ("9", '    <span class="comment"># Eagerly initialize and warm up SymSpell 82k+ English unigrams & bigrams</span>'),
            ("10", '    <span class="var">spelling_service</span>.<span class="fn">_ensure_initialized</span>()'),
            ("11", '    <span class="kw">yield</span>'),
            ("12", ''),
            ("13", '<span class="var">app</span> = <span class="type">FastAPI</span>('),
            ("14", '    <span class="var">title</span>=<span class="str">"SpellSense NLP Intelligence Engine"</span>,'),
            ("15", '    <span class="var">description</span>=<span class="str">"Production REST API for TextBlob and SymSpell Spelling Correction"</span>,'),
            ("16", '    <span class="var">version</span>=<span class="str">"2.0.0"</span>,'),
            ("17", '    <span class="var">lifespan</span>=<span class="var">lifespan</span>'),
            ("18", ')'),
            ("19", ''),
            ("20", '<span class="comment"># Configure Cross-Origin Resource Sharing for React frontend</span>'),
            ("21", '<span class="var">app</span>.<span class="fn">add_middleware</span>(<span class="type">CORSMiddleware</span>, <span class="var">allow_origins</span>=[<span class="str">"*"</span>], <span class="var">allow_methods</span>=[<span class="str">"*"</span>], <span class="var">allow_headers</span>=[<span class="str">"*"</span>])'),
            ("22", '<span class="var">app</span>.<span class="fn">include_router</span>(<span class="var">correction</span>.<span class="var">router</span>, <span class="var">prefix</span>=<span class="str">"/api"</span>, <span class="var">tags</span>=[<span class="str">"Spelling Correction"</span>])')
        ]
    },
    {
        "id": "fig5_3_spelling_service",
        "title": "Spelling Correction Service Pipeline - backend/app/services/spelling_service.py",
        "filename": "spelling_service.py",
        "lines": [
            ("1", '<span class="kw">def</span> <span class="fn">correct_text</span>(<span class="var">self</span>, <span class="var">text</span>: <span class="type">str</span>, <span class="var">algorithm</span>: <span class="type">str</span> = <span class="str">"compare"</span>) -> <span class="type">CorrectionResponse</span>:'),
            ("2", '    <span class="var">t_total_start</span> = <span class="var">time</span>.<span class="fn">perf_counter</span>()'),
            ("3", '    <span class="var">self</span>.<span class="fn">_ensure_initialized</span>()'),
            ("4", '    <span class="var">tokens</span> = <span class="var">self</span>.<span class="fn">_tokenize_with_spans</span>(<span class="var">text</span>)'),
            ("5", '    <span class="var">corrections</span>: <span class="type">List</span>[<span class="type">CorrectionItem</span>] = []'),
            ("6", '    <span class="comment"># Method dispatch: optimize execution based on user selection</span>'),
            ("7", '    <span class="kw">if</span> <span class="var">algorithm</span> == <span class="str">"symspell"</span>:'),
            ("8", '        <span class="var">corrections</span> = <span class="var">self</span>.<span class="fn">_run_symspell_only</span>(<span class="var">tokens</span>)'),
            ("9", '    <span class="kw">elif</span> <span class="var">algorithm</span> == <span class="str">"textblob"</span>:'),
            ("10", '        <span class="var">corrections</span> = <span class="var">self</span>.<span class="fn">_run_textblob_only</span>(<span class="var">tokens</span>)'),
            ("11", '    <span class="kw">else</span>:'),
            ("12", '        <span class="var">corrections</span> = <span class="var">self</span>.<span class="fn">_run_comparison_pipeline</span>(<span class="var">tokens</span>)'),
            ("13", '    <span class="var">t_total_end</span> = <span class="var">time</span>.<span class="fn">perf_counter</span>()'),
            ("14", '    <span class="var">total_ms</span> = <span class="fn">round</span>((<span class="var">t_total_end</span> - <span class="var">t_total_start</span>) * <span class="num">1000</span>, <span class="num">3</span>)'),
            ("15", '    <span class="kw">return</span> <span class="type">CorrectionResponse</span>('),
            ("16", '        <span class="var">original_text</span>=<span class="var">text</span>,'),
            ("17", '        <span class="var">recommended_result</span>=<span class="var">self</span>.<span class="fn">_reconstruct</span>(<span class="var">tokens</span>, <span class="str">"recommended"</span>),'),
            ("18", '        <span class="var">corrections</span>=<span class="var">corrections</span>,'),
            ("19", '        <span class="var">processing_time_ms</span>=<span class="var">total_ms</span>'),
            ("20", '    )')
        ]
    },
    {
        "id": "fig5_4_textblob_implementation",
        "title": "TextBlob Probabilistic Spelling Correction - backend/app/services/spelling_service.py",
        "filename": "spelling_service.py",
        "lines": [
            ("1", '<span class="kw">def</span> <span class="fn">_correct_word_textblob</span>(<span class="var">self</span>, <span class="var">word</span>: <span class="type">str</span>) -> <span class="type">Tuple</span>[<span class="type">str</span>, <span class="type">float</span>, <span class="type">List</span>[<span class="type">CandidateItem</span>]]:'),
            ("2", '    <span class="comment"># Fast-path: O(1) dictionary hit checks avoid expensive candidate exploration</span>'),
            ("3", '    <span class="kw">if</span> <span class="var">word</span>.<span class="fn">lower</span>() <span class="kw">in</span> <span class="var">self</span>.<span class="var">_common_vocab</span>:'),
            ("4", '        <span class="kw">return</span> <span class="var">word</span>, <span class="num">1.0</span>, [<span class="type">CandidateItem</span>(<span class="var">term</span>=<span class="var">word</span>, <span class="var">score</span>=<span class="num">1.0</span>, <span class="var">engine</span>=<span class="str">"TextBlob"</span>)]'),
            ("5", '    <span class="comment"># Norvig unigram probability model from TextBlob Speller</span>'),
            ("6", '    <span class="var">speller</span> = <span class="var">self</span>.<span class="var">_tb_speller</span>'),
            ("7", '    <span class="var">corrected</span> = <span class="var">speller</span>.<span class="fn">correct</span>(<span class="var">word</span>.<span class="fn">lower</span>())'),
            ("8", '    <span class="comment"># Extract candidate variations and calculate normalized probabilities</span>'),
            ("9", '    <span class="var">candidates_raw</span> = <span class="var">speller</span>.<span class="fn">candidates</span>(<span class="var">word</span>.<span class="fn">lower</span>())'),
            ("10", '    <span class="var">total_weight</span> = <span class="fn">sum</span>(<span class="var">prob</span> <span class="kw">for</span> <span class="var">_</span>, <span class="var">prob</span> <span class="kw">in</span> <span class="var">candidates_raw</span>) <span class="kw">or</span> <span class="num">1.0</span>'),
            ("11", '    <span class="var">candidates</span> = ['),
            ("12", '        <span class="type">CandidateItem</span>('),
            ("13", '            <span class="var">term</span>=<span class="var">c</span>,'),
            ("14", '            <span class="var">score</span>=<span class="fn">round</span>(<span class="var">prob</span> / <span class="var">total_weight</span>, <span class="num">4</span>),'),
            ("15", '            <span class="var">engine</span>=<span class="str">"TextBlob"</span>'),
            ("16", '        ) <span class="kw">for</span> <span class="var">c</span>, <span class="var">prob</span> <span class="kw">in</span> <span class="var">candidates_raw</span>[:<span class="num">5</span>]'),
            ("17", '    ]'),
            ("18", '    <span class="var">confidence</span> = <span class="var">candidates</span>[<span class="num">0</span>].<span class="var">score</span> <span class="kw">if</span> <span class="var">candidates</span> <span class="kw">else</span> <span class="num">0.5</span>'),
            ("19", '    <span class="kw">return</span> <span class="var">corrected</span>, <span class="var">confidence</span>, <span class="var">candidates</span>')
        ]
    },
    {
        "id": "fig5_5_symspell_implementation",
        "title": "SymSpell Singleton & Symmetric Delete Engine - backend/app/services/spelling_service.py",
        "filename": "spelling_service.py",
        "lines": [
            ("1", '<span class="kw">class</span> <span class="type">SpellingService</span>:'),
            ("2", '    <span class="var">_instance</span> = <span class="kw">None</span>'),
            ("3", '    <span class="kw">def</span> <span class="fn">__new__</span>(<span class="var">cls</span>):'),
            ("4", '        <span class="kw">if</span> <span class="var">cls</span>.<span class="var">_instance</span> <span class="kw">is</span> <span class="kw">None</span>:'),
            ("5", '            <span class="var">cls</span>.<span class="var">_instance</span> = <span class="fn">super</span>().<span class="fn">__new__</span>(<span class="var">cls</span>)'),
            ("6", '            <span class="var">cls</span>.<span class="var">_instance</span>.<span class="fn">_init_engine</span>()'),
            ("7", '        <span class="kw">return</span> <span class="var">cls</span>.<span class="var">_instance</span>'),
            ("8", ''),
            ("9", '    <span class="kw">def</span> <span class="fn">_init_engine</span>(<span class="var">self</span>):'),
            ("10", '        <span class="comment"># SymSpell with max_dictionary_edit_distance=2 and prefix_length=7</span>'),
            ("11", '        <span class="var">self</span>.<span class="var">_symspell</span> = <span class="type">SymSpell</span>(<span class="var">max_dictionary_edit_distance</span>=<span class="num">2</span>, <span class="var">prefix_length</span>=<span class="num">7</span>)'),
            ("12", '        <span class="var">dict_path</span> = <span class="var">pkg_resources</span>.<span class="fn">resource_filename</span>(<span class="str">"symspellpy"</span>, <span class="str">"frequency_dictionary_en_82_765.txt"</span>)'),
            ("13", '        <span class="var">self</span>.<span class="var">_symspell</span>.<span class="fn">load_dictionary</span>(<span class="var">dict_path</span>, <span class="var">term_index</span>=<span class="num">0</span>, <span class="var">count_index</span>=<span class="num">1</span>)'),
            ("14", '        <span class="var">bigram_path</span> = <span class="var">pkg_resources</span>.<span class="fn">resource_filename</span>(<span class="str">"symspellpy"</span>, <span class="str">"frequency_bigramdictionary_en_243_342.txt"</span>)'),
            ("15", '        <span class="var">self</span>.<span class="var">_symspell</span>.<span class="fn">load_bigram_dictionary</span>(<span class="var">bigram_path</span>, <span class="var">term_index</span>=<span class="num">0</span>, <span class="var">count_index</span>=<span class="num">2</span>)'),
            ("16", '        <span class="comment"># Cache raw vocabulary words in a set for O(1) hash table lookups</span>'),
            ("17", '        <span class="var">self</span>.<span class="var">_common_vocab</span> = <span class="fn">set</span>(<span class="var">self</span>.<span class="var">_symspell</span>.<span class="var">words</span>.<span class="fn">keys</span>())')
        ]
    },
    {
        "id": "fig5_6_consensus_logic",
        "title": "Consensus & Candidate Selection Engine - backend/app/services/spelling_service.py",
        "filename": "spelling_service.py",
        "lines": [
            ("1", '<span class="kw">def</span> <span class="fn">_decide_recommendation</span>(<span class="var">self</span>, <span class="var">orig</span>, <span class="var">tb_corr</span>, <span class="var">tb_conf</span>, <span class="var">ss_corr</span>, <span class="var">ss_dist</span>, <span class="var">ss_count</span>):'),
            ("2", '    <span class="comment"># Rule 1: High-confidence Consensus between both algorithms</span>'),
            ("3", '    <span class="kw">if</span> <span class="var">tb_corr</span>.<span class="fn">lower</span>() == <span class="var">ss_corr</span>.<span class="fn">lower</span>():'),
            ("4", '        <span class="kw">return</span> <span class="var">ss_corr</span>, <span class="str">"Both (Consensus)"</span>, <span class="str">"High"</span>, <span class="str">f"Consensus between TextBlob and SymSpell at edit distance {ss_dist}."</span>'),
            ("5", '    <span class="comment"># Rule 2: Minimal Edit Distance preference (Symmetric Deletes)</span>'),
            ("6", '    <span class="kw">if</span> <span class="var">ss_dist</span> == <span class="num">1</span> <span class="kw">and</span> <span class="var">ss_count</span> > <span class="num">5000</span>:'),
            ("7", '        <span class="kw">return</span> <span class="var">ss_corr</span>, <span class="str">"SymSpell (Closer Edit)"</span>, <span class="str">"High"</span>, <span class="str">f"SymSpell chose \'{ss_corr}\' with single-character mutation."</span>'),
            ("8", '    <span class="comment"># Rule 3: TextBlob linguistic probability preference</span>'),
            ("9", '    <span class="kw">if</span> <span class="var">tb_conf</span> > <span class="num">0.85</span>:'),
            ("10", '        <span class="kw">return</span> <span class="var">tb_corr</span>, <span class="str">"TextBlob (Higher Prob)"</span>, <span class="str">"Medium"</span>, <span class="str">f"TextBlob confidence {tb_conf:.2f} ranked higher."</span>'),
            ("11", '    <span class="comment"># Fallback: Default to lower edit distance</span>'),
            ("12", '    <span class="kw">return</span> <span class="var">ss_corr</span>, <span class="str">"SymSpell (Frequency)"</span>, <span class="str">"Medium"</span>, <span class="str">f"SymSpell corpus frequency preference ({ss_count:,} occurrences)."</span>')
        ]
    },
    {
        "id": "fig5_7_frontend_corrector",
        "title": "Interactive React Workspace - frontend/src/pages/CorrectorPage.tsx",
        "filename": "CorrectorPage.tsx",
        "lines": [
            ("1", '<span class="kw">export const</span> <span class="fn">CorrectorPage</span>: <span class="type">React.FC</span> = () => {'),
            ("2", '  <span class="kw">const</span> [<span class="var">text</span>, <span class="fn">setText</span>] = <span class="fn">useState</span>(<span class="str">"I hav a beutiful day and I am goin to the markat."</span>);'),
            ("3", '  <span class="kw">const</span> [<span class="var">algorithm</span>, <span class="fn">setAlgorithm</span>] = <span class="fn">useState</span>&lt;<span class="str">"compare"</span> | <span class="str">"symspell"</span> | <span class="str">"textblob"</span>&gt;(<span class="str">"compare"</span>);'),
            ("4", '  <span class="kw">const</span> [<span class="var">status</span>, <span class="fn">setStatus</span>] = <span class="fn">useState</span>&lt;<span class="str">"idle"</span> | <span class="str">"processing"</span> | <span class="str">"success"</span> | <span class="str">"error"</span>&gt;(<span class="str">"idle"</span>);'),
            ("5", '  <span class="kw">const</span> [<span class="var">result</span>, <span class="fn">setResult</span>] = <span class="fn">useState</span>&lt;<span class="type">CorrectionResponse</span> | <span class="kw">null</span>&gt;(<span class="kw">null</span>);'),
            ("6", '  <span class="kw">const</span> <span class="var">isRequestingRef</span> = <span class="fn">useRef</span>(<span class="kw">false</span>);'),
            ("7", ''),
            ("8", '  <span class="kw">const</span> <span class="fn">handleCorrect</span> = <span class="kw">async</span> (<span class="var">textToRun</span> = <span class="var">text</span>, <span class="var">algoToRun</span> = <span class="var">algorithm</span>) => {'),
            ("9", '    <span class="kw">if</span> (<span class="var">isRequestingRef</span>.<span class="var">current</span>) <span class="kw">return</span>; <span class="comment">// Concurrency guard</span>'),
            ("10", '    <span class="fn">setStatus</span>(<span class="str">"processing"</span>);'),
            ("11", '    <span class="kw">try</span> {'),
            ("12", '      <span class="kw">const</span> <span class="var">data</span> = <span class="kw">await</span> <span class="fn">correctText</span>(<span class="var">textToRun</span>.<span class="fn">trim</span>(), <span class="var">algoToRun</span>);'),
            ("13", '      <span class="fn">setResult</span>(<span class="var">data</span>);'),
            ("14", '      <span class="fn">setStatus</span>(<span class="str">"success"</span>); <span class="comment">// Single render pass update</span>'),
            ("15", '    } <span class="kw">catch</span> (<span class="var">e</span>) { <span class="fn">setStatus</span>(<span class="str">"error"</span>); }'),
            ("16", '  };'),
            ("17", '  <span class="kw">return</span> &lt;<span class="type">div</span> <span class="var">className</span>=<span class="str">"max-w-5xl mx-auto px-4"</span>&gt;...&lt;/<span class="type">div</span>&gt;;'),
            ("18", '};')
        ]
    },
    {
        "id": "fig5_8_word_inspector_api",
        "title": "Single Word Deep Analysis Endpoint - backend/app/api/endpoints/correction.py",
        "filename": "correction.py",
        "lines": [
            ("1", '<span class="kw">@router</span>.<span class="fn">post</span>(<span class="str">"/analyze-word"</span>, <span class="var">response_model</span>=<span class="type">SingleWordAnalysis</span>)'),
            ("2", '<span class="kw">async def</span> <span class="fn">analyze_single_word</span>(<span class="var">request</span>: <span class="type">WordAnalysisRequest</span>):'),
            ("3", '    <span class="str">"""Returns detailed candidate generation breakdown, deletes, and metrics."""</span>'),
            ("4", '    <span class="var">word</span> = <span class="var">request</span>.<span class="var">word</span>.<span class="fn">strip</span>()'),
            ("5", '    <span class="kw">if not</span> <span class="var">word</span>:'),
            ("6", '        <span class="kw">raise</span> <span class="type">HTTPException</span>(<span class="var">status_code</span>=<span class="num">400</span>, <span class="var">detail</span>=<span class="str">"Word cannot be empty"</span>)'),
            ("7", '    <span class="var">analysis</span> = <span class="var">spelling_service</span>.<span class="fn">analyze_word</span>('),
            ("8", '        <span class="var">word</span>=<span class="var">word</span>,'),
            ("9", '        <span class="var">max_edit_distance</span>=<span class="var">request</span>.<span class="var">max_edit_distance</span>'),
            ("10", '    )'),
            ("11", '    <span class="kw">return</span> <span class="var">analysis</span>')
        ]
    }
]

for m in mockups:
    content_html = ""
    for num, code in m["lines"]:
        content_html += f'<div><span class="line-num">{num}</span>{code}</div>\n'
    full_html = code_template.replace("__TITLE__", m["title"]).replace("__FILENAME__", m["filename"]).replace("__CONTENT__", content_html)
    fpath = f"report_assets/implementation/{m['id']}.html"
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"Generated HTML for {m['id']}")

print("All code mockup HTML files generated successfully.")
