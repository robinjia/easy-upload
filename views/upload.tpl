% rebase('base.tpl')
<h2>{{title}}</h2>
<p>{{text}}</p>
<div id="uploader"></div>
<script type="text/javascript">
//<![CDATA[
  new Uploader("uploader").render();
//]]>
</script>
