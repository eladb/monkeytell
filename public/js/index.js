(function($) {

  $('#success').hide();
  $('#form').show();

  $('#create').click(function() {

    //
    // address
    //

    var address = $('#address').val();

    $('#address-group').removeClass('error');
    
    if (!address) {
      $('#address-group').addClass('error');
      $('#address').tooltip({ title: 'address is required', trigger: 'focus' });
      $('#address').focus();
      return;
    }

    if (address.indexOf('@') !== -1) {
      $('#address-group').addClass('error');
      $('#address').tooltip({ title: 'no monkey tails', trigger: 'focus' });
      $('#address').focus();
      return;
    }

    address = address + '@listzz.com';

    //
    // members
    //

    var members = $('#members').val().split('\n');

    members = members.filter(function(x) { return x && x.length >0 });

    $('#members-group').removeClass('error');

    if (!members || members.length < 1) {
      $('#members-group').addClass('error');
      $('#members-group').tooltip('damn');
      return;
    }

    //
    // prepare metadata
    //

    var metadata = {
      owner: members[0],
      members: members,
    };

    console.log('Creating list', address, 'with metadata:', metadata);
    
    $.post('/groups/' + address, metadata)
      .success(function(data, textStatus, jqxhr) {
        console.log(data);
        console.log(textStatus);
        console.log(jqxhr.body);
        $('#form').hide();
        $('#success').show();
        $('#new-list').text(address);
        $('#new-list').attr('href', 'mailto:' + address);
      })
      .error(function(data, textStatus, jqxhr) {
        console.error(textStatus);
        console.error(jqxhr);
        $('#address-group').addClass('error');
        $('#address').tooltip({ title: 'address is already taken, sorry...', trigger: 'focus' });
        $('#address').focus();
      });

  });
  
})(jQuery);