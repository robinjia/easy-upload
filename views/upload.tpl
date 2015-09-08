% rebase('base.tpl')
<h2>{{title}}</h2>
<p>Welcome to our upload page!  Use this webpage to send us large files.</p>
<div id="uploader"></div>
<script type="text/javascript">
//<![CDATA[
  new Uploader("uploader").render();
//]]>
</script>
