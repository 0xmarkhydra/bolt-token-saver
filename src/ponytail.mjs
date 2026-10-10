/**
 * The six skills shipped by the upstream Ponytail plugin. Install the plugin
 * once per agent; these are not six separate packages.
 */
export const PONYTAIL_SKILLS = [
  {id:'ponytail',name:'Ponytail',about:'Viết code tối giản, đủ test và bảo mật'},
  {id:'ponytail-review',name:'Review',about:'Review thay đổi code và tác động liên quan'},
  {id:'ponytail-audit',name:'Audit',about:'Rà soát chất lượng toàn repository'},
  {id:'ponytail-debt',name:'Debt',about:'Theo dõi các giải pháp tạm thời'},
  {id:'ponytail-gain',name:'Gain',about:'Xem benchmark từ tác giả, không phải số đo máy bạn'},
  {id:'ponytail-help',name:'Help',about:'Tra cứu chế độ và lệnh sử dụng'},
];
export const ponytailCommand=(agent,id)=>agent==='codex'
  ? '$ponytail:'+id
  : '/'+id;
